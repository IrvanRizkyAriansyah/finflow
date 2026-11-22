import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import './assets/main.css'

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[PWA] Aplikasi siap dipakai offline.')
  },
})

createApp(App).use(router).mount('#app')