import { createContext } from 'react'

export interface CompanyInfo {
  name: string
  tagline: string
  phone: string
  email: string
  address: string
  license: string
}

export interface CompanyContextValue {
  company: CompanyInfo
  saveCompany: (info: CompanyInfo) => void
}

export const CompanyContext = createContext<CompanyContextValue | null>(null)
