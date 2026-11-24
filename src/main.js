import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import { t } from './composables/useI18n'
import './assets/main.css'

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[PWA] Aplikasi siap dipakai offline.')
  },
})

const app = createApp(App)
app.config.globalProperties.$t = t
app.use(router).mount('#app')