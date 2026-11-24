<script setup>
import OnboardingHero from '@/components/auth/OnboardingHero.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
</script>

<template>
  <main class="mx-auto grid min-h-screen max-w-5xl items-center gap-6 p-margin-mobile md:grid-cols-2 md:gap-margin">
    <OnboardingHero />
    <div class="space-y-4 md:px-6">
      <GoogleSignInButton />
      <p class="text-center text-body-sm text-on-surface-variant">
        {{ $t('onboarding.privacy') }}
      </p>
    </div>
  </main>
</template>