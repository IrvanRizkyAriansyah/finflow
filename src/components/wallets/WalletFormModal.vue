<script setup>
import { reactive, computed, watch, ref } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useTransactions } from "@/composables/useTransactions";

const props = defineProps({
  modelValue: Boolean,
  wallet: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue"]);
const { wallets, walletUsage, addWallet, updateWallet, deleteWallet } =
  useTransactions();

const TYPES = [
  { id: "cash", label: "Tunai" },
  { id: "bank", label: "Rekening Bank" },
  { id: "debit", label: "Kartu Debit" },
  { id: "credit", label: "Kartu Kredit" },
  { id: "ewallet", label: "E-Wallet" },
];

const form = reactive({ name: "", type: "bank", balanceText: "" });
const errorMsg = ref("");
const confirmingDelete = ref(false);

const isEdit = computed(() => !!props.wallet);
const usage = computed(() =>
  props.wallet ? (walletUsage.value.get(props.wallet.id) ?? 0) : 0,
);
const canDelete = computed(
  () => isEdit.value && usage.value === 0 && wallets.value.length > 1,
);
const balance = computed(
  () => Number(form.balanceText.replace(/\D/g, "")) || 0,
);
const close = () => emit("update:modelValue", false);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    const w = props.wallet;
    Object.assign(
      form,
      w
        ? {
            name: w.name,
            type: w.type,
            balanceText: Number(w.initial_balance).toLocaleString("id-ID"),
          }
        : { name: "", type: "bank", balanceText: "" },
    );
    errorMsg.value = "";
    confirmingDelete.value = false;
  },
);

function onBalanceInput(e) {
  const digits = e.target.value.replace(/\D/g, "");
  form.balanceText = digits ? Number(digits).toLocaleString("id-ID") : "";
}

function submit() {
  errorMsg.value = "";
  try {
    const data = {
      name: form.name,
      type: form.type,
      initial_balance: balance.value,
    };
    if (isEdit.value) updateWallet(props.wallet.id, data);
    else addWallet(data);
    close();
  } catch (e) {
    errorMsg.value = e.message;
  }
}

function remove() {
  try {
    deleteWallet(props.wallet.id);
    close();
  } catch (e) {
    errorMsg.value = e.message;
    confirmingDelete.value = false;
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? 'Ubah Dompet' : 'Tambah Dompet'"
    @update:model-value="(v) => !v && close()"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block">
        <span class="text-label-md">Nama</span>
        <input
          v-model="form.name"
          maxlength="40"
          placeholder="mis. BCA, GoPay, Dompet Harian"
          class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
        />
      </label>

      <label class="block">
        <span class="text-label-md">Jenis</span>
        <div class="relative min-w-0 flex-1">
          <select
            v-model="form.type"
            class="mt-1 w-full appearance-none rounded-lg border border-outline-variant bg-transparent px-4 py-3"
          >
            <option v-for="t in TYPES" :key="t.id" :value="t.id">
              {{ t.label }}
            </option>
          </select>
          <svg
            class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </div>
      </label>

      <label class="block">
        <span class="text-label-md">Saldo awal</span>
        <div
          class="mt-1 flex items-center rounded-lg border border-outline-variant px-4 focus-within:border-primary"
        >
          <span class="text-on-surface-variant">Rp</span>
          <input
            :value="form.balanceText"
            inputmode="numeric"
            placeholder="0"
            autocomplete="off"
            class="w-full bg-transparent px-2 py-3 font-display text-headline-sm outline-none"
            @input="onBalanceInput"
          />
        </div>
        <span class="mt-1 block text-body-sm text-on-surface-variant"
          >Saldo sebelum transaksi pertama dicatat di aplikasi.</span
        >
      </label>

      <p v-if="errorMsg" role="alert" class="text-body-sm text-error">
        {{ errorMsg }}
      </p>

      <button
        type="submit"
        class="w-full rounded-xl bg-primary py-4 font-semibold text-on-primary"
      >
        {{ isEdit ? "Simpan Perubahan" : "Simpan" }}
      </button>

      <div v-if="isEdit" class="border-t border-outline-variant/40 pt-4">
        <p
          v-if="!canDelete"
          class="text-center text-body-sm text-on-surface-variant"
        >
          <template v-if="usage"
            >Dipakai {{ usage }} transaksi, jadi belum bisa dihapus.</template
          >
          <template v-else>Minimal harus ada satu dompet.</template>
        </p>
        <template v-else>
          <button
            v-if="!confirmingDelete"
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-label-md text-error hover:bg-error-container/40"
            @click="confirmingDelete = true"
          >
            <AppIcon name="delete" /> Hapus dompet
          </button>
          <div v-else class="space-y-2">
            <p class="text-center text-body-sm">
              Hapus dompet ini dari Google Sheets Anda?
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="rounded-xl bg-surface-container py-3 text-label-md"
                @click="confirmingDelete = false"
              >
                Batal
              </button>
              <button
                type="button"
                class="rounded-xl bg-error py-3 text-label-md text-white"
                @click="remove"
              >
                Ya, hapus
              </button>
            </div>
          </div>
        </template>
      </div>
    </form>
  </BaseModal>
</template>
