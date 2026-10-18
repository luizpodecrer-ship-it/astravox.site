import { useState, useEffect } from 'react'
import { translations } from '../data/translations'
import { LanguageContext } from './LanguageContext'

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_language')
      if (saved === 'pt' || saved === 'en') return saved
    }
    return 'pt' // Default to Portuguese (Brazil) as requested
  })

  const setLanguage = (lang) => {
    if (lang === 'pt' || lang === 'en') {
      setLanguageState(lang)
      try {
        localStorage.setItem('nexus_language', lang)
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'
  }, [language])

  const t = translations[language] || translations.pt

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider
