import { create } from 'zustand'
import type { Topic } from '@prisma/client'

interface NewPostStore {
  topics: Topic[]
  fetchTopics: () => Promise<void>
}

export const useStore = create<NewPostStore>()((set) => ({
  topics: [],
  fetchTopics: async () => {
    try {
      const response = await fetch('/api/topics')
      const data = await response.json()
      set({ topics: data })
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    }
  },
})) 