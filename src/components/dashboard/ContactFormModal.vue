<script setup>
import { reactive, computed, watch, ref } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useTransactions } from "@/composables/useTransactions";
import { ACCOUNT_TYPES, accountTypeMeta } from "@/utils/accountTypes";

const props = defineProps({
  modelValue: Boolean,
  contact: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue"]);
const { addContact, updateContact, deleteContact } = useTransactions();

const MAX_ACCOUNTS = 6;
let keySeed = 0;
const blankAccount = () => ({
  key: ++keySeed,
  type: "bank",
  provider: "",
  number: "",
});

const form = reactive({ name: "", note: "", accounts: [] });
const errorMsg = ref("");
const confirmingDelete = ref(false);

const isEdit = computed(() => !!props.contact);
const close = () => emit("update:modelValue", false);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    const c = props.contact;
    form.name = c?.name ?? "";
    form.note = c?.note ?? "";
    form.accounts = c?.accounts?.length
      ? c.accounts.map((a) => ({
          key: ++keySeed,
          type: a.type || "bank",
          provider: a.provider || "",
          number: a.number || "",
        }))
      : [blankAccount()];
    errorMsg.value = "";
    confirmingDelete.value = false;
  },
);

const addAccount = () => {
  if (form.accounts.length < MAX_ACCOUNTS) form.accounts.push(blankAccount());
};
const removeAccount = (i) => form.accounts.splice(i, 1);

function submit() {
  errorMsg.value = "";
  try {
    const data = {
      name: form.name,
      note: form.note,
      accounts: form.accounts.map(({ type, provider, number }) => ({
        type,
        provider,
        number,
      })),
    };
    if (isEdit.value) updateContact(props.contact.id, data);
    else addContact(data);
    close();
  } catch (e) {
    errorMsg.value = e.message;
  }
}

function remove() {
  deleteContact(props.contact.id);
  close();
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? 'Ubah Kontak' : 'Tambah Kontak'"
    @update:model-value="(v) => !v && close()"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block">
        <span class="text-label-md">Nama</span>
        <input
          v-model="form.name"
          maxlength="40"
          placeholder="mis. Budi"
          class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
        />
      </label>

      <div class="space-y-3">
        <span class="text-label-md">Nomor rekening / VA</span>

        <div
          v-for="(a, i) in form.accounts"
          :key="a.key"
          class="space-y-2 rounded-lg border border-outline-variant p-3"
        >
          <div class="flex gap-2">
            <div class="relative min-w-0 flex-1">
              <select
                v-model="a.type"
                class="w-full appearance-none rounded-lg border border-outline-variant bg-transparent px-3 py-2 pr-10"
              >
                <option v-for="t in ACCOUNT_TYPES" :key="t.id" :value="t.id">
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
            <button
              type="button"
              class="rounded-lg p-2 text-error hover:bg-error-container/40"
              :aria-label="`Hapus rekening ${i + 1}`"
              @click="removeAccount(i)"
            >
              <AppIcon name="delete" />
            </button>
          </div>
          <input
            v-model="a.provider"
            maxlength="40"
            :placeholder="accountTypeMeta(a.type).hint"
            class="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2"
          />
          <input
            v-model="a.number"
            maxlength="40"
            autocomplete="off"
            :inputmode="a.type === 'other' ? 'text' : 'numeric'"
            placeholder="Nomor"
            class="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2 tabular-nums"
          />
        </div>

        <button
          v-if="form.accounts.length < MAX_ACCOUNTS"
          type="button"
          class="flex w-full items-center justify-center gap-1 rounded-lg bg-surface-container py-2 text-label-md"
          @click="addAccount"
        >
          <AppIcon name="add" /> Tambah rekening
        </button>
      </div>

      <label class="block">
        <span class="text-label-md">Catatan</span>
        <input
          v-model="form.note"
          maxlength="80"
          placeholder="Opsional"
          class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
        />
      </label>

      <p class="text-body-sm text-on-surface-variant">
        Jangan simpan PIN, password, atau kode CVV di sini.
      </p>
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
        <button
          v-if="!confirmingDelete"
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-label-md text-error hover:bg-error-container/40"
          @click="confirmingDelete = true"
        >
          <AppIcon name="delete" /> Hapus kontak
        </button>
        <div v-else class="space-y-2">
          <p class="text-center text-body-sm">
            Hapus kontak ini dari Google Sheets Anda?
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
      </div>
    </form>
  </BaseModal>
</template>
