// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  experimental: {
    externalVue: false,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  // Vite optimizasyonu: Lucide ikonlarının hızlı yüklenmesi ve uyarıların gitmesi için
  vite: {
    optimizeDeps: {
      include: ['lucide-vue-next', 'vue']
    }
  },

  // Tailwind yapılandırması
  tailwindcss: {
    config: {
      content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './app.vue',
        './error.vue'
      ]
    }
  },

  // Frontend içinde backend URL'sine kolay erişim için (useRuntimeConfig)
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001'
    }
  }
})