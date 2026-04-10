import { ref } from 'vue'
import { api } from './useApi'

export function useHealthCheck() {
  const health = ref<{ status: string } | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const checkHealth = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/api/health')
      health.value = response.data
    } catch (e) {
      error.value = 'No se pudo conectar al servidor'
      health.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    health,
    isLoading,
    error,
    checkHealth
  }
}
