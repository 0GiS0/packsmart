<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '@/stores/trip'
import { generatePackingList, categoryIcons } from '@/utils/packingGenerator'

const router = useRouter()
const tripStore = useTripStore()

type FilterType = 'all' | 'pending' | 'packed'
const activeFilter = ref<FilterType>('all')

// Add item modal
const showAddModal = ref(false)
const newItemName = ref('')
const newItemCategory = ref('Personal')

// Share modal
const showShareModal = ref(false)
const shareSuccess = ref(false)
const copySuccess = ref(false)

const availableCategories = [
  'Ropa',
  'Higiene',
  'Electrónica',
  'Documentos',
  'Salud',
  'Playa',
  'Senderismo',
  'Ciudad',
  'Crucero',
  'Personal'
]

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

const openAddModal = () => {
  newItemName.value = ''
  newItemCategory.value = 'Personal'
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const addCustomItem = () => {
  if (newItemName.value.trim()) {
    tripStore.addCustomItem(newItemName.value.trim(), newItemCategory.value)
    closeAddModal()
  }
}

// Share functionality
const generateShareText = () => {
  if (!tripStore.trip) return ''
  
  let text = `🧳 Lista de equipaje para ${tripStore.trip.destination}\n`
  text += `📅 ${formatDate(tripStore.trip.startDate)} - ${formatDate(tripStore.trip.endDate)} (${tripStore.tripDuration} días)\n`
  text += `🎯 ${tripStore.trip.activities.map(a => activityNames[a]).join(', ')}\n\n`
  
  const grouped: Record<string, typeof tripStore.packingItems> = {}
  for (const item of tripStore.packingItems) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }
  
  for (const [category, items] of Object.entries(grouped)) {
    text += `${categoryIcons[category] || '📦'} ${category}:\n`
    for (const item of items) {
      const check = item.packed ? '✅' : '⬜'
      text += `  ${check} ${item.name}\n`
    }
    text += '\n'
  }
  
  text += `\nProgreso: ${tripStore.packedCount}/${tripStore.totalCount} (${tripStore.progress}%)\n`
  text += `\n\u00a1Creado con PackSmart! 🧳✈️`
  
  return text
}

const canShare = computed(() => {
  return typeof navigator !== 'undefined' && !!navigator.share
})

const openShareModal = () => {
  shareSuccess.value = false
  copySuccess.value = false
  showShareModal.value = true
}

const closeShareModal = () => {
  showShareModal.value = false
}

const shareNative = async () => {
  const text = generateShareText()
  try {
    await navigator.share({
      title: `Lista de equipaje - ${tripStore.trip?.destination}`,
      text: text
    })
    shareSuccess.value = true
    setTimeout(() => closeShareModal(), 1500)
  } catch (err) {
    console.log('Share cancelled')
  }
}

const copyToClipboard = async () => {
  const text = generateShareText()
  try {
    await navigator.clipboard.writeText(text)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy')
  }
}

const shareViaWhatsApp = () => {
  const text = encodeURIComponent(generateShareText())
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

const shareViaEmail = () => {
  const subject = encodeURIComponent(`Lista de equipaje - ${tripStore.trip?.destination}`)
  const body = encodeURIComponent(generateShareText())
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
}
</script>

<template>
  <div class="min-h-screen py-8 px-4 pb-24" v-if="tripStore.trip">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="flex items-center justify-between mb-4">
          <button 
            @click="router.push('/trip')"
            class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <span>←</span>
            <span>Editar viaje</span>
          </button>
          <button
            @click="openShareModal"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
          >
            <span>📤</span>
            <span>Compartir</span>
          </button>
        </div>
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
      <div class="flex gap-2 mb-6 flex-wrap">
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

    <!-- Floating Add Button -->
    <button
      @click="openAddModal"
      class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-2xl z-10"
    >
      +
    </button>

    <!-- Add Item Modal -->
    <div 
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeAddModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>➕</span>
            Añadir artículo
          </h3>
          <button 
            @click="closeAddModal"
            class="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="label">Nombre del artículo</label>
            <input
              v-model="newItemName"
              type="text"
              class="input"
              placeholder="Ej: Cámara instantánea, Libro..."
              @keyup.enter="addCustomItem"
            />
          </div>

          <div>
            <label class="label">Categoría</label>
            <select v-model="newItemCategory" class="input">
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ categoryIcons[cat] || '📦' }} {{ cat }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="closeAddModal"
            class="flex-1 btn btn-outline"
          >
            Cancelar
          </button>
          <button
            @click="addCustomItem"
            :disabled="!newItemName.trim()"
            :class="[
              'flex-1 btn',
              newItemName.trim() ? 'btn-secondary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div 
      v-if="showShareModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeShareModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>📤</span>
            Compartir lista
          </h3>
          <button 
            @click="closeShareModal"
            class="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="shareSuccess" class="text-center py-8">
          <span class="text-5xl block mb-4">✅</span>
          <p class="text-lg font-semibold text-green-600">¡Compartido con éxito!</p>
        </div>

        <!-- Share Options -->
        <div v-else class="space-y-3">
          <p class="text-gray-500 text-sm mb-4">
            Comparte tu lista de equipaje con tus compañeros de viaje
          </p>

          <!-- Native Share (mobile) -->
          <button
            v-if="canShare"
            @click="shareNative"
            class="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <span class="text-2xl">📱</span>
            <span class="font-semibold">Compartir</span>
          </button>

          <!-- WhatsApp -->
          <button
            @click="shareViaWhatsApp"
            class="w-full flex items-center gap-3 p-4 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all"
          >
            <span class="text-2xl">💬</span>
            <span class="font-semibold">WhatsApp</span>
          </button>

          <!-- Email -->
          <button
            @click="shareViaEmail"
            class="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-all"
          >
            <span class="text-2xl">📧</span>
            <span class="font-semibold">Email</span>
          </button>

          <!-- Copy to Clipboard -->
          <button
            @click="copyToClipboard"
            :class="[
              'w-full flex items-center gap-3 p-4 rounded-xl transition-all',
              copySuccess 
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            <span class="text-2xl">{{ copySuccess ? '✅' : '📋' }}</span>
            <span class="font-semibold">{{ copySuccess ? '¡Copiado!' : 'Copiar al portapapeles' }}</span>
          </button>
        </div>

        <button
          @click="closeShareModal"
          class="w-full mt-4 text-gray-500 hover:text-gray-700"
        >
          Cerrar
        </button>
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
