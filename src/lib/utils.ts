import { ulid } from 'ulid'

export function generateId(): string {
  return ulid()
}

export function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(' ')
} 