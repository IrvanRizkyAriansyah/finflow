<script setup>
import { useRouter } from "vue-router";
import AvatarImage from "@/components/ui/AvatarImage.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useGoogleAuth } from "@/composables/useGoogleAuth";
import { useGoogleSheets } from "@/composables/useGoogleSheets";
import { useTransactions } from "@/composables/useTransactions";

const router = useRouter();
const { user, signOut } = useGoogleAuth();
const { spreadsheetUrl } = useGoogleSheets();
const { pendingCount, lastSyncedAt, isSyncing, load, resetData } =
  useTransactions();

const syncedText = () =>
  lastSyncedAt.value
    ? new Date(lastSyncedAt.value).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Belum pernah";

async function handleSignOut() {
  if (
    pendingCount.value &&
    !confirm(
      "Ada transaksi yang belum tersinkron dan akan hilang bila Anda keluar. Lanjutkan?",
    )
  )
    return;
  resetData(); // hapus cache data keuangan dari perangkat
  await signOut();
  router.replace("/onboarding");
}
</script>

<template>
  <div class="mx-auto max-w-xl space-y-gutter-mobile">
    <section
      class="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-sm"
    >
      <AvatarImage :src="user?.picture" :name="user?.name" size="h-16 w-16" />
      <div class="min-w-0">
        <h1 class="truncate text-headline-sm">{{ user?.name }}</h1>
        <p class="truncate text-body-sm text-on-surface-variant">
          {{ user?.email }}
        </p>
      </div>
    </section>

    <section
      class="space-y-3 rounded-xl bg-surface-container-lowest p-5 shadow-sm"
    >
      <h2 class="text-headline-sm">{{ $t('profile.database') }}</h2>
      <p class="text-body-sm text-on-surface-variant">
        {{ $t('profile.lastSync',syncedText()) }}{{ syncedText()
        }}<template v-if="pendingCount">
          · {{ $t(pendingCount,'profile.pending') }}</template
        >
      </p>
      <div class="flex flex-wrap gap-3">
        <a
          v-if="spreadsheetUrl()"
          :href="spreadsheetUrl()"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary"
          ><AppIcon name="open_in_new" /> {{ $t('profile.openSheet') }}</a
        >
        <button
          class="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-label-md disabled:opacity-50"
          :disabled="isSyncing"
          @click="load()"
        >
          <AppIcon name="sync" /> {{ $t('profile.sync') }}
        </button>
      </div>
    </section>

    <RouterLink
      to="/goals"
      class="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 shadow-sm"
    >
      <span class="flex items-center gap-3 text-label-md"
        ><AppIcon name="savings" /> {{ $t('profile.goals') }}</span
      >
      <AppIcon name="chevron_right" />
    </RouterLink>

    <RouterLink
      to="/categories"
      class="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 shadow-sm"
    >
      <span class="flex items-center gap-3 text-label-md"
        ><AppIcon name="category" /> {{ $t('profile.manageCategories') }}</span
      >
      <AppIcon name="chevron_right" />
    </RouterLink>

    <button
      class="w-full rounded-xl bg-error-container py-3 font-semibold text-on-error-container"
      @click="handleSignOut"
    >
      {{ $t('profile.signOut') }}
    </button>
  </div>
</template>
