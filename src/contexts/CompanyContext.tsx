import { useState } from 'react'
import { CompanyContext } from './company-context'
import type { CompanyInfo } from './company-context'

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

export type { CompanyInfo } from './company-context'
