import { createContext, useContext, useState } from 'react'

export interface CompanyInfo {
  name: string
  tagline: string
  phone: string
  email: string
  address: string
  license: string
}

const DEFAULTS: CompanyInfo = {
  name: 'Hammertime',
  tagline: 'Construction & Metal Buildings',
  phone: '',
  email: '',
  address: '',
  license: '',
}

const STORAGE_KEY = 'hammertime_company'

function load(): CompanyInfo {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

interface CompanyContextValue {
  company: CompanyInfo
  saveCompany: (info: CompanyInfo) => void
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyInfo>(load)

  function saveCompany(info: CompanyInfo) {
    setCompany(info)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
  }

  return (
    <CompanyContext.Provider value={{ company, saveCompany }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider')
  return ctx
}
