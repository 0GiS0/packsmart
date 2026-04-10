import type { ActivityType, PackingItem } from '@/types'

interface PackingTemplate {
  name: string
  category: string
  activities: ActivityType[] | 'all'
  perDays?: number
}

const packingTemplates: PackingTemplate[] = [
  // Essentials - always included
  { name: 'Pasaporte/DNI', category: 'Documentos', activities: 'all' },
  { name: 'Tarjetas de crédito/débito', category: 'Documentos', activities: 'all' },
  { name: 'Seguro de viaje', category: 'Documentos', activities: 'all' },
  { name: 'Teléfono móvil', category: 'Electrónica', activities: 'all' },
  { name: 'Cargador de teléfono', category: 'Electrónica', activities: 'all' },
  { name: 'Adaptador de enchufe', category: 'Electrónica', activities: 'all' },
  { name: 'Medicamentos personales', category: 'Salud', activities: 'all' },
  { name: 'Botiquín básico', category: 'Salud', activities: 'all' },
  
  // Clothing basics - per days
  { name: 'Camisetas', category: 'Ropa', activities: 'all', perDays: 1 },
  { name: 'Ropa interior', category: 'Ropa', activities: 'all', perDays: 1 },
  { name: 'Calcetines', category: 'Ropa', activities: 'all', perDays: 1 },
  { name: 'Pijama', category: 'Ropa', activities: 'all' },
  { name: 'Chaqueta ligera', category: 'Ropa', activities: 'all' },
  
  // Toiletries
  { name: 'Cepillo de dientes', category: 'Higiene', activities: 'all' },
  { name: 'Pasta de dientes', category: 'Higiene', activities: 'all' },
  { name: 'Desodorante', category: 'Higiene', activities: 'all' },
  { name: 'Champú', category: 'Higiene', activities: 'all' },
  { name: 'Gel de ducha', category: 'Higiene', activities: 'all' },
  
  // Beach specific
  { name: 'Bañador/Bikini', category: 'Playa', activities: ['beach'] },
  { name: 'Toalla de playa', category: 'Playa', activities: ['beach'] },
  { name: 'Protector solar', category: 'Playa', activities: ['beach'] },
  { name: 'Gafas de sol', category: 'Playa', activities: ['beach'] },
  { name: 'Sombrero/Gorra', category: 'Playa', activities: ['beach'] },
  { name: 'Chanclas', category: 'Playa', activities: ['beach'] },
  { name: 'Bolsa impermeable', category: 'Playa', activities: ['beach'] },
  { name: 'Snorkel', category: 'Playa', activities: ['beach'] },
  
  // Hiking specific
  { name: 'Botas de senderismo', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Mochila de trekking', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Bastones de senderismo', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Cantimplora', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Impermeable/Chubasquero', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Ropa térmica', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Linterna frontal', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Mapa/GPS', category: 'Senderismo', activities: ['hiking'] },
  { name: 'Protector solar SPF50', category: 'Senderismo', activities: ['hiking'] },
  
  // City specific
  { name: 'Zapatos cómodos para caminar', category: 'Ciudad', activities: ['city'] },
  { name: 'Mochila pequeña/Bolso', category: 'Ciudad', activities: ['city'] },
  { name: 'Guía de viaje', category: 'Ciudad', activities: ['city'] },
  { name: 'Cámara de fotos', category: 'Ciudad', activities: ['city'] },
  { name: 'Ropa elegante (cena)', category: 'Ciudad', activities: ['city'] },
  { name: 'Paraguas plegable', category: 'Ciudad', activities: ['city'] },
  
  // Cruise specific
  { name: 'Ropa formal (cena de gala)', category: 'Crucero', activities: ['cruise'] },
  { name: 'Traje de baño', category: 'Crucero', activities: ['cruise'] },
  { name: 'Medicamento mareo', category: 'Crucero', activities: ['cruise'] },
  { name: 'Binoculares', category: 'Crucero', activities: ['cruise'] },
  { name: 'Tarjeta de embarque', category: 'Crucero', activities: ['cruise'] },
  { name: 'Zapatos de vestir', category: 'Crucero', activities: ['cruise'] },
  { name: 'Chaqueta para cubierta', category: 'Crucero', activities: ['cruise'] },
]

export function generatePackingList(activities: ActivityType[], days: number): PackingItem[] {
  const items: PackingItem[] = []
  let idCounter = 1

  for (const template of packingTemplates) {
    const shouldInclude = 
      template.activities === 'all' || 
      template.activities.some(a => activities.includes(a))

    if (shouldInclude) {
      let name = template.name
      
      // Adjust quantity for per-day items
      if (template.perDays) {
        const quantity = Math.min(Math.ceil(days * template.perDays), days + 2)
        name = `${template.name} (x${quantity})`
      }

      items.push({
        id: `item-${idCounter++}`,
        name,
        category: template.category,
        packed: false,
        isCustom: false
      })
    }
  }

  return items
}

export const categoryIcons: Record<string, string> = {
  'Documentos': '📝',
  'Electrónica': '📱',
  'Salud': '💊',
  'Ropa': '👕',
  'Higiene': '🧼',
  'Playa': '🏖️',
  'Senderismo': '⛰️',
  'Ciudad': '🏙️',
  'Crucero': '🚢',
  'Personal': '🎒'
}
