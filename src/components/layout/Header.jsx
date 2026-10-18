import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, X, Camera as Instagram, Briefcase as Linkedin, MessageCircle as Twitter, Palette as Dribbble } from 'lucide-react'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useLanguage } from '../../hooks/useLanguage'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const { t } = useLanguage()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80)
  })

  const navLinks = t.nav.links
  const socials = [<Linkedin key="ln"/>, <Twitter key="tw"/>, <Instagram key="ig"/>, <Dribbble key="dr"/>]

  return (
    <>
      <header 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? 'backdrop-blur-xl bg-ink-950/80 border-b border-white/5 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Studio Brand Logo */}
          <a href="#" className="flex items-center gap-2 cursor-pointer z-50 group">
            <span className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-signal transition-colors">NEXUS</span>
            <div className="w-2 h-2 rounded-full bg-signal animate-pulse-slow"></div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a 
                key={item.href} 
                href={item.href}
                className="font-body text-sm text-mist-900 hover:text-white transition-colors relative group"
                data-cursor="hover"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-[1px] bg-signal w-0 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Language Switcher with Brazil and USA flag buttons (Replaces 'Start a Project' button) */}
          <div className="hidden md:flex items-center">
            <LanguageSwitcher />
          </div>

          {/* Mobile Navigation trigger & mobile flags */}
          <div className="flex md:hidden items-center gap-3 z-50">
            <LanguageSwitcher isMobile={false} />
            <button 
              className="text-white p-2 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900 z-40 flex flex-col justify-center px-6"
          >
            <nav className="flex flex-col gap-6 mt-20">
              {navLinks.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-display text-5xl sm:text-6xl text-white hover:text-signal transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <LanguageSwitcher isMobile={true} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 left-6 flex gap-6 text-mist-900"
            >
              {socials.map((icon, i) => (
                <a key={i} href="#" className="hover:text-white">{icon}</a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
