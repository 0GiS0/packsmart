<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '@/stores/trip'
import type { ActivityType } from '@/types'

const router = useRouter()
const tripStore = useTripStore()

const destination = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedActivities = ref<ActivityType[]>([])

const activities = [
  { id: 'beach' as ActivityType, name: 'Playa', icon: '🏖️', color: 'from-cyan-400 to-blue-500' },
  { id: 'hiking' as ActivityType, name: 'Senderismo', icon: '⛰️', color: 'from-green-400 to-emerald-600' },
  { id: 'city' as ActivityType, name: 'Ciudad', icon: '🏙️', color: 'from-purple-400 to-indigo-600' },
  { id: 'cruise' as ActivityType, name: 'Crucero', icon: '🚢', color: 'from-blue-400 to-blue-700' },
]

const toggleActivity = (activityId: ActivityType) => {
  const index = selectedActivities.value.indexOf(activityId)
  if (index === -1) {
    selectedActivities.value.push(activityId)
  } else {
    selectedActivities.value.splice(index, 1)
  }
}

const isActivitySelected = (activityId: ActivityType) => {
  return selectedActivities.value.includes(activityId)
}

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const minEndDate = computed(() => {
  return startDate.value || today.value
})

const isFormValid = computed(() => {
  return destination.value.trim() !== '' &&
    startDate.value !== '' &&
    endDate.value !== '' &&
    selectedActivities.value.length > 0
})

const generatePackingList = () => {
  if (!isFormValid.value) return

  tripStore.setTrip({
    destination: destination.value,
    startDate: startDate.value,
    endDate: endDate.value,
    activities: selectedActivities.value
  })

  router.push('/packing-list')
}
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <button 
          @click="router.push('/')"
          class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <span>←</span>
          <span>Volver</span>
        </button>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          🌍 Planifica tu viaje
        </h1>
        <p class="text-gray-500">Cuéntanos sobre tu próxima aventura</p>
      </div>

      <!-- Form Card -->
      <div class="card">
        <!-- Destination -->
        <div class="mb-6">
          <label class="label">
            <span class="flex items-center gap-2">
              <span>📍</span>
              ¿A dónde vas?
            </span>
          </label>
          <input
            v-model="destination"
            type="text"
            class="input"
            placeholder="Ej: Cancún, París, Tokio..."
          />
        </div>

        <!-- Dates -->
        <div class="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="label">
              <span class="flex items-center gap-2">
                <span>📅</span>
                Fecha de inicio
              </span>
            </label>
            <input
              v-model="startDate"
              type="date"
              class="input"
              :min="today"
            />
          </div>
          <div>
            <label class="label">
              <span class="flex items-center gap-2">
                <span>📅</span>
                Fecha de fin
              </span>
            </label>
            <input
              v-model="endDate"
              type="date"
              class="input"
              :min="minEndDate"
            />
          </div>
        </div>

        <!-- Activities -->
        <div class="mb-8">
          <label class="label mb-4">
            <span class="flex items-center gap-2">
              <span>🎯</span>
              ¿Qué tipo de actividades harás?
            </span>
          </label>
          <p class="text-sm text-gray-500 mb-4">Selecciona todas las que apliquen</p>
          
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="activity in activities"
              :key="activity.id"
              @click="toggleActivity(activity.id)"
              :class="[
                'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                isActivitySelected(activity.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              ]"
            >
              <div class="flex items-center gap-3">
                <div 
                  :class="[
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                    isActivitySelected(activity.id)
                      ? `bg-gradient-to-br ${activity.color} text-white`
                      : 'bg-gray-100'
                  ]"
                >
                  {{ activity.icon }}
                </div>
                <span class="font-semibold text-gray-700">{{ activity.name }}</span>
              </div>
              <div 
                v-if="isActivitySelected(activity.id)"
                class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-sm">✓</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          @click="generatePackingList"
          :disabled="!isFormValid"
          :class="[
            'w-full btn text-lg py-4 flex items-center justify-center gap-3',
            isFormValid
              ? 'btn-secondary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:transform-none hover:shadow-md'
          ]"
        >
          <span>Generar mi lista de equipaje</span>
          <span class="text-xl">🧳</span>
        </button>

        <p v-if="!isFormValid" class="text-center text-sm text-gray-400 mt-3">
          Completa todos los campos para continuar
        </p>
      </div>
    </div>
  </div>
</template>
