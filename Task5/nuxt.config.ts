// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxthq/ui', '@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Your Default Title', // Default title for the app
      titleTemplate: '', // Appends ' - Your Site Name' to page-specific titles
    }
  },

  compatibilityDate: '2025-04-07'
})