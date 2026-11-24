<script setup>
import { reactive, computed, watch, ref } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useTransactionModal } from "@/composables/useTransactionModal";
import { useTransactions } from "@/composables/useTransactions";
import { todayStr } from "@/utils/formatDate";

const { isOpen, preset, editing, close } = useTransactionModal();
const {
  categories,
  wallets,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = useTransactions();

const form = reactive({
  type: "expense",
  amountText: "",
  category_id: "",
  wallet_id: "",
  date: "",
  note: "",
});
const submitting = ref(false);
const errorMsg = ref("");
const confirmingDelete = ref(false);

const isEdit = computed(() => !!editing.value);
const filteredCategories = computed(() =>
  categories.value.filter((c) => c.type === form.type),
);
const amount = computed(() => Number(form.amountText.replace(/\D/g, "")) || 0);

function ensureCategory() {
  if (!filteredCategories.value.some((c) => c.id === form.category_id)) {
    form.category_id = filteredCategories.value[0]?.id ?? "";
  }
}

watch(isOpen, (open) => {
  if (!open) return;
  const tx = editing.value;
  Object.assign(
    form,
    tx
      ? {
          type: tx.type,
          amountText: Number(tx.amount).toLocaleString("id-ID"),
          category_id: tx.category_id,
          wallet_id: tx.wallet_id || wallets.value[0]?.id || "",
          date: tx.date,
          note: tx.note ?? "",
        }
      : {
          type: preset.value.type ?? "expense",
          amountText: "",
          category_id: preset.value.category_id ?? "",
          wallet_id: wallets.value[0]?.id ?? "",
          date: todayStr(),
          note: preset.value.note ?? "",
        },
  );
  errorMsg.value = "";
  confirmingDelete.value = false;
  ensureCategory();
});
watch(() => form.type, ensureCategory);

function onAmountInput(e) {
  const digits = e.target.value.replace(/\D/g, "");
  const formatted = digits ? Number(digits).toLocaleString("id-ID") : "";
  form.amountText = formatted;
  e.target.value = formatted;
}

async function submit() {
  errorMsg.value = "";
  if (!amount.value) return (errorMsg.value = t('tx.errAmountMin'));
  if (!form.category_id) return (errorMsg.value = t('tx.errCategory'));
  submitting.value = true;
  try {
    const payload = {
      type: form.type,
      amount: amount.value,
      category_id: form.category_id,
      wallet_id: form.wallet_id,
      date: form.date,
      note: form.note,
    };
    if (isEdit.value) await updateTransaction(editing.value.id, payload);
    else await addTransaction(payload);
    close();
  } catch (e) {
    errorMsg.value = e.message;
  } finally {
    submitting.value = false;
  }
}

function remove() {
  deleteTransaction(editing.value.id);
  close();
}
</script>

<template>
  <BaseModal
    :model-value="isOpen"
    :title="isEdit ? $t('common.edit')+' '+$t('common.transaction') : $t('common.add')+' '+$t('common.transaction')"
    @update:model-value="(v) => !v && close()"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div
        class="grid grid-cols-2 gap-1 rounded-lg bg-surface-container p-1"
        role="group"
        :aria-label="$t('tx.type')"
      >
        <button
          type="button"
          class="rounded-md py-2 text-label-md"
          :class="
            form.type === 'expense'
              ? 'bg-surface-container-lowest shadow-sm'
              : 'text-on-surface-variant'
          "
          @click="form.type = 'expense'"
        >
          {{ $t('common.expense') }}
        </button>
        <button
          type="button"
          class="rounded-md py-2 text-label-md"
          :class="
            form.type === 'income'
              ? 'bg-surface-container-lowest shadow-sm'
              : 'text-on-surface-variant'
          "
          @click="form.type = 'income'"
        >
          {{ $t('common.income') }}
        </button>
      </div>

      <label class="block">
        <span class="text-label-md">{{ $t('common.amount') }}</span>
        <div
          class="mt-1 flex items-center rounded-lg border border-outline-variant px-4 focus-within:border-primary"
        >
          <span class="text-on-surface-variant">Rp</span>
          <input
            :value="form.amountText"
            inputmode="numeric"
            placeholder="0"
            autocomplete="off"
            class="w-full bg-transparent px-2 py-3 font-display text-headline-sm outline-none"
            @input="onAmountInput"
          />
        </div>
      </label>

      <label class="block">
        <span class="text-label-md">Kategori</span>
        <div class="relative min-w-0 flex-1">
          <select
            v-model="form.category_id"
            class="mt-1 w-full appearance-none rounded-lg border border-outline-variant bg-transparent px-4 py-3"
          >
            <option v-for="c in filteredCategories" :key="c.id" :value="c.id">
              {{ c.name }}
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

      <label v-if="wallets.length > 1" class="block">
        <span class="text-label-md">{{$t('common.wallet')}}</span>
        <div class="relative min-w-0 flex-1">
          <select
            v-model="form.wallet_id"
            class="mt-1 w-full appearance-none rounded-lg border border-outline-variant bg-transparent px-4 py-3"
          >
            <option v-for="w in wallets" :key="w.id" :value="w.id">
              {{ w.name }}
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

      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="text-label-md">{{ $t('common.date') }}</span>
          <input
            v-model="form.date"
            type="date"
            class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
          />
        </label>
        <label class="block">
          <span class="text-label-md">{{ $t('common.note') }}</span>
          <input
            v-model="form.note"
            maxlength="80"
            placeholder="Opsional"
            class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
          />
        </label>
      </div>

      <p
        v-if="!filteredCategories.length"
        class="text-body-sm text-on-surface-variant"
      >
        {{ $t('tx.categoryNotLoaded') }}
      </p>
      <p v-if="errorMsg" role="alert" class="text-body-sm text-error">
        {{ errorMsg }}
      </p>

      <button
        type="submit"
        :disabled="submitting || !filteredCategories.length"
        class="w-full rounded-xl bg-primary py-4 font-semibold text-on-primary disabled:opacity-50"
      >
        {{ isEdit ? $t('common.saveChanges') : $t('common.save') }}
      </button>

      <div v-if="isEdit" class="border-t border-outline-variant/40 pt-4">
        <button
          v-if="!confirmingDelete"
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-label-md text-error hover:bg-error-container/40"
          @click="confirmingDelete = true"
        >
          <AppIcon name="delete" /> {{$t('tx.delete')}}
        </button>
        <div v-else class="space-y-2">
          <p class="text-center text-body-sm">
            {{$t('tx.deleteConfirm')}}
          </p>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-xl bg-surface-container py-3 text-label-md"
              @click="confirmingDelete = false"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              class="rounded-xl bg-error py-3 text-label-md text-white"
              @click="remove"
            >
              {{ $t('common.confirmDelete') }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </BaseModal>
</template>
