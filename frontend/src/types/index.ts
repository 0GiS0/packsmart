export interface Requirement {
  id: number
  title: string
  description: string
}

export type ActivityType = 'beach' | 'hiking' | 'city' | 'cruise'

export interface Trip {
  destination: string
  startDate: string
  endDate: string
  activities: ActivityType[]
}

export interface PackingItem {
  id: string
  name: string
  category: string
  packed: boolean
  isCustom: boolean
}
