<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '@/stores/trip'
import { generatePackingList, categoryIcons } from '@/utils/packingGenerator'

const router = useRouter()
const tripStore = useTripStore()

type FilterType = 'all' | 'pending' | 'packed'
const activeFilter = ref<FilterType>('all')

onMounted(() => {
  if (!tripStore.trip) {
    router.push('/trip')
    return
  }

  if (tripStore.packingItems.length === 0) {
    const items = generatePackingList(
      tripStore.trip.activities,
      tripStore.tripDuration
    )
    tripStore.setPackingItems(items)
  }
})

const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return tripStore.packingItems
  if (activeFilter.value === 'pending') return tripStore.packingItems.filter(i => !i.packed)
  return tripStore.packingItems.filter(i => i.packed)
})

const itemsByCategory = computed(() => {
  const grouped: Record<string, typeof filteredItems.value> = {}
  
  for (const item of filteredItems.value) {
    if (!grouped[item.category]) {
      grouped[item.category] = []
    }
    grouped[item.category].push(item)
  }
  
  return grouped
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const activityNames: Record<string, string> = {
  beach: '🏖️ Playa',
  hiking: '⛰️ Senderismo',
  city: '🏙️ Ciudad',
  cruise: '🚢 Crucero'
}

const handleToggle = (itemId: string) => {
  tripStore.toggleItemPacked(itemId)
}
</script>

<template>
  <div class="min-h-screen py-8 px-4" v-if="tripStore.trip">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <button 
          @click="router.push('/trip')"
          class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <span>←</span>
          <span>Editar viaje</span>
        </button>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          🧳 Tu lista de equipaje
        </h1>
      </div>

      <!-- Trip Summary Card -->
      <div class="card mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-blue-100 text-sm">Destino</p>
            <h2 class="text-2xl font-bold">{{ tripStore.trip.destination }}</h2>
          </div>
          <div class="text-right">
            <p class="text-blue-100 text-sm">{{ formatDate(tripStore.trip.startDate) }} - {{ formatDate(tripStore.trip.endDate) }}</p>
            <p class="font-semibold">{{ tripStore.tripDuration }} días</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <span 
            v-for="activity in tripStore.trip.activities" 
            :key="activity"
            class="px-3 py-1 bg-white/20 rounded-full text-sm"
          >
            {{ activityNames[activity] }}
          </span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold text-gray-700">Progreso de equipaje</span>
          <span class="text-blue-600 font-bold">{{ tripStore.packedCount }}/{{ tripStore.totalCount }}</span>
        </div>
        <div class="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500 ease-out"
            :style="{ width: `${tripStore.progress}%` }"
          ></div>
        </div>
        <p class="text-center text-sm text-gray-500 mt-2">
          <span v-if="tripStore.progress === 100" class="text-green-600 font-semibold flex items-center justify-center gap-2">
            <span class="text-xl animate-bounce">🎉</span>
            ¡Todo listo para el viaje!
            <span class="text-xl animate-bounce" style="animation-delay: 0.1s">🎊</span>
          </span>
          <span v-else-if="tripStore.progress >= 75" class="text-blue-600">
            🚀 ¡Ya casi estás!
          </span>
          <span v-else-if="tripStore.progress >= 50">
            💪 ¡Vas muy bien!
          </span>
          <span v-else-if="tripStore.progress >= 25">
            👍 Buen comienzo
          </span>
          <span v-else>
            📦 Aún quedan cosas por empacar
          </span>
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeFilter = 'all'"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition-all duration-200',
            activeFilter === 'all'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          Todos ({{ tripStore.totalCount }})
        </button>
        <button
          @click="activeFilter = 'pending'"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition-all duration-200',
            activeFilter === 'pending'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          Pendientes ({{ tripStore.totalCount - tripStore.packedCount }})
        </button>
        <button
          @click="activeFilter = 'packed'"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition-all duration-200',
            activeFilter === 'packed'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          ]"
        >
          Empacados ({{ tripStore.packedCount }})
        </button>
      </div>

      <!-- Packing List by Category -->
      <div class="space-y-4">
        <div 
          v-for="(items, category) in itemsByCategory" 
          :key="category"
          class="card"
        >
          <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-xl">{{ categoryIcons[category] || '📦' }}</span>
            {{ category }}
            <span class="text-sm font-normal text-gray-400">
              ({{ items.filter(i => i.packed).length }}/{{ items.length }})
            </span>
          </h3>
          
          <div class="space-y-2">
            <label
              v-for="item in items"
              :key="item.id"
              :class="[
                'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group',
                item.packed 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-gray-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200'
              ]"
            >
              <div class="relative">
                <input
                  type="checkbox"
                  :checked="item.packed"
                  @change="handleToggle(item.id)"
                  class="sr-only"
                />
                <div 
                  :class="[
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200',
                    item.packed 
                      ? 'bg-green-500 border-green-500 scale-110' 
                      : 'border-gray-300 group-hover:border-blue-400'
                  ]"
                >
                  <svg 
                    v-if="item.packed"
                    class="w-4 h-4 text-white"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="3" 
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <span 
                :class="[
                  'flex-1 transition-all duration-200', 
                  item.packed ? 'line-through text-gray-400' : 'text-gray-700'
                ]"
              >
                {{ item.name }}
              </span>
              <span v-if="item.isCustom" class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Personal
              </span>
              <button
                v-if="item.isCustom"
                @click.prevent="tripStore.removeItem(item.id)"
                class="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </label>
          </div>
        </div>
      </div>

      <!-- Empty State for Filters -->
      <div v-if="Object.keys(itemsByCategory).length === 0 && tripStore.packingItems.length > 0" class="card text-center py-12">
        <span class="text-5xl mb-4 block">
          {{ activeFilter === 'packed' ? '🎉' : '✅' }}
        </span>
        <h3 class="text-xl font-bold text-gray-700 mb-2">
          {{ activeFilter === 'packed' ? 'Aún no has empacado nada' : '¡Todo empacado!' }}
        </h3>
        <p class="text-gray-500">
          {{ activeFilter === 'packed' ? 'Marca los artículos conforme los vayas metiendo' : 'No tienes artículos pendientes' }}
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="tripStore.packingItems.length === 0" class="card text-center py-12">
        <span class="text-5xl mb-4 block">🧳</span>
        <h3 class="text-xl font-bold text-gray-700 mb-2">Lista vacía</h3>
        <p class="text-gray-500">No hay artículos en tu lista de equipaje</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom checkbox animation */
input[type="checkbox"]:checked + div {
  animation: checkmark 0.2s ease-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.1);
  }
}
</style>
