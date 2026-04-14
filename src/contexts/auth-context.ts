import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/app.types'

export interface AuthContextValue {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
