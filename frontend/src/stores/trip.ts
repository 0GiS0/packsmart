import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, ActivityType, PackingItem } from '@/types'

export const useTripStore = defineStore('trip', () => {
  const trip = ref<Trip | null>(null)
  const packingItems = ref<PackingItem[]>([])

  const tripDuration = computed(() => {
    if (!trip.value) return 0
    const start = new Date(trip.value.startDate)
    const end = new Date(trip.value.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  })

  const setTrip = (newTrip: Trip) => {
    trip.value = newTrip
  }

  const setPackingItems = (items: PackingItem[]) => {
    packingItems.value = items
  }

  const toggleItemPacked = (itemId: string) => {
    const item = packingItems.value.find(i => i.id === itemId)
    if (item) {
      item.packed = !item.packed
    }
  }

  const addCustomItem = (name: string, category: string) => {
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name,
      category,
      packed: false,
      isCustom: true
    }
    packingItems.value.push(newItem)
    return newItem
  }

  const removeItem = (itemId: string) => {
    packingItems.value = packingItems.value.filter(i => i.id !== itemId)
  }

  const packedCount = computed(() => 
    packingItems.value.filter(i => i.packed).length
  )

  const totalCount = computed(() => packingItems.value.length)

  const progress = computed(() => 
    totalCount.value > 0 ? Math.round((packedCount.value / totalCount.value) * 100) : 0
  )

  return {
    trip,
    packingItems,
    tripDuration,
    packedCount,
    totalCount,
    progress,
    setTrip,
    setPackingItems,
    toggleItemPacked,
    addCustomItem,
    removeItem
  }
})
