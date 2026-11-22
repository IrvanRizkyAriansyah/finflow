<script setup>
import { useRouter } from 'vue-router'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { useGoogleSheets } from '@/composables/useGoogleSheets'

const router = useRouter()
const { signIn, isLoading, error } = useGoogleAuth()
const { setupDatabase, status, error: sheetsError } = useGoogleSheets()

async function handleSignIn() {
  try {
    await signIn()           // 1. popup OAuth + ambil profil
    await setupDatabase()    // 2. cari / buat spreadsheet + 3 tab
    router.replace('/')
  } catch { /* pesan error sudah ada di `error` / `useGoogleSheets().error` */ }
}
</script>

<template>
  <button
    class="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-primary-container bg-surface-container-lowest px-6 py-4 font-semibold shadow-sm disabled:opacity-60"
    :disabled="isLoading || status === 'checking' || status === 'creating'"
    @click="handleSignIn"
  >
    <span v-if="status === 'creating'">Menyiapkan database di Google Sheets…</span>
    <span v-else-if="isLoading || status === 'checking'">Menghubungkan…</span>
    <span v-else class="text-primary">Sign in with Google</span>
  </button>
  <p v-if="error || sheetsError" role="alert" class="mt-2 text-body-sm text-error">
    {{ error || `Gagal menyiapkan database: ${sheetsError.message}` }}
  </p>

</template>