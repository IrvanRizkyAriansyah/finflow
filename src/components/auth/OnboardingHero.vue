<template>
  <section class="overflow-hidden rounded-xl bg-primary-container text-on-primary">
    <img
      src="/img/hero.jpg" alt="" class="h-72 w-full object-cover md:h-96"
      @error="$event.target.style.display = 'none'"
    />
    <div class="p-6 md:p-8">
      <h1 class="text-headline-lg">
        All Your Finances.
        <span class="text-secondary-container">One Powerful Platform.</span>
      </h1>
      <p class="mt-3 text-body-md text-on-primary-container">
        Catat pemasukan dan pengeluaran, dengan data tersimpan di Google Sheets milik Anda sendiri.
      </p>
    </div>
  </section>
</template>