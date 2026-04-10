<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHealthCheck } from '@/composables/useHealthCheck'

const router = useRouter()
const { health, checkHealth } = useHealthCheck()

const showContent = ref(false)

onMounted(async () => {
  await checkHealth()
  setTimeout(() => {
    showContent.value = true
  }, 500)
})

const startPlanning = () => {
  router.push('/trip')
}
</script>

<template>
  <!-- Loading Splash -->
  <div v-if="!showContent" class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="relative">
        <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-orange-400 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
          <span class="text-5xl">🧳</span>
        </div>
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center animate-ping">
          <span class="text-lg">✈️</span>
        </div>
      </div>
      <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
        PackSmart
      </h1>
      <p class="text-gray-500 mt-2">Cargando tu asistente de viaje...</p>
    </div>
  </div>

  <!-- Main Content -->
  <div v-else class="min-h-screen">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Decorative Elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-300/30 to-yellow-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-300/30 to-cyan-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div class="relative max-w-4xl mx-auto px-6 py-16">
        <!-- Logo & Title -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl mb-6">
            <span class="text-4xl">🧳</span>
          </div>
          <h1 class="text-5xl font-extrabold mb-4">
            <span class="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Pack</span><span class="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Smart</span>
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu asistente inteligente de equipaje. Nunca más olvides nada en tus viajes.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="card text-center hover:shadow-xl transition-shadow">
            <div class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🌤️</span>
            </div>
            <h3 class="font-bold text-gray-800 mb-2">Basado en clima</h3>
            <p class="text-sm text-gray-500">Sugerencias según el tiempo en tu destino</p>
          </div>
          
          <div class="card text-center hover:shadow-xl transition-shadow">
            <div class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
              <span class="text-2xl">🎒</span>
            </div>
            <h3 class="font-bold text-gray-800 mb-2">Por actividad</h3>
            <p class="text-sm text-gray-500">Playa, senderismo, ciudad o crucero</p>
          </div>
          
          <div class="card text-center hover:shadow-xl transition-shadow">
            <div class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center">
              <span class="text-2xl">✅</span>
            </div>
            <h3 class="font-bold text-gray-800 mb-2">Fácil control</h3>
            <p class="text-sm text-gray-500">Marca lo que ya empacaste</p>
          </div>
        </div>

        <!-- CTA Button -->
        <div class="text-center">
          <button 
            @click="startPlanning"
            class="btn btn-primary text-lg px-10 py-4 inline-flex items-center gap-3"
          >
            <span>Planificar mi viaje</span>
            <span class="text-xl">✈️</span>
          </button>
          <p class="text-gray-400 text-sm mt-4">¡Es gratis y no necesitas registrarte!</p>
        </div>

        <!-- Health Status -->
        <div v-if="health" class="mt-12 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sistema conectado
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
