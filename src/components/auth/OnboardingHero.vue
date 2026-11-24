<template>
  <section class="overflow-hidden rounded-xl bg-primary-container text-on-primary">
    <img
      src="/img/hero.jpg" alt="" class="h-72 w-full object-cover md:h-96"
      @error="$event.target.style.display = 'none'"
    />
    <div class="p-6 md:p-8">
      <h1 class="text-headline-lg">
        {{ $t('hero.line1') }}
        <span class="text-secondary-container">{{ $t('hero.line2') }}</span>
      </h1>
      <p class="mt-3 text-body-md text-on-primary-container">
        {{ $t('hero.subtitle') }}
      </p>
    </div>
  </section>
</template>