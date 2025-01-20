import { create } from 'zustand'

interface Post {
  id: string
  title: string
  content: string
  description?: string | null
}

interface PostStore {
  post: Post | null
  isLoading: boolean
  setPost: (post: Post | null) => void
  setLoading: (loading: boolean) => void
}

export const usePostStore = create<PostStore>((set) => ({
  post: null,
  isLoading: false,
  setPost: (post) => set({ post }),
  setLoading: (loading) => set({ isLoading: loading }),
})) 