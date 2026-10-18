import { motion } from 'framer-motion'
import { useLanguage } from '../../hooks/useLanguage'

export function BrazilFlag({ className = "w-6 h-4" }) {
  return (
    <svg 
      viewBox="0 0 720 504" 
      className={`rounded-[3px] shadow-sm flex-shrink-0 ${className}`} 
      aria-hidden="true"
    >
      {/* Green Field */}
      <rect width="720" height="504" fill="#009c3b" />
      {/* Yellow Rhombus */}
      <polygon points="360,59 660,252 360,445 60,252" fill="#ffdf00" />
      {/* Blue Celestial Circle */}
      <circle cx="360" cy="252" r="126" fill="#002776" />
      {/* White Curved Band */}
      <path
        d="M234,252 A150,150 0 0,0 486,252 A135,135 0 0,1 234,252"
        fill="#ffffff"
      />
      {/* Southern Cross and decorative white stars */}
      <circle cx="360" cy="225" r="4.5" fill="#ffffff" />
      <circle cx="375" cy="245" r="4.5" fill="#ffffff" />
      <circle cx="345" cy="250" r="4.5" fill="#ffffff" />
      <circle cx="360" cy="275" r="5" fill="#ffffff" />
      <circle cx="380" cy="290" r="4" fill="#ffffff" />
      <circle cx="320" cy="295" r="4" fill="#ffffff" />
      <circle cx="410" cy="270" r="3.5" fill="#ffffff" />
    </svg>
  )
}

export function USAFlag({ className = "w-6 h-4" }) {
  return (
    <svg 
      viewBox="0 0 741 390" 
      className={`rounded-[3px] shadow-sm flex-shrink-0 ${className}`} 
      aria-hidden="true"
    >
      {/* 13 Stripes */}
      <rect width="741" height="390" fill="#ffffff" />
      <rect y="0" width="741" height="30" fill="#b22234" />
      <rect y="60" width="741" height="30" fill="#b22234" />
      <rect y="120" width="741" height="30" fill="#b22234" />
      <rect y="180" width="741" height="30" fill="#b22234" />
      <rect y="240" width="741" height="30" fill="#b22234" />
      <rect y="300" width="741" height="30" fill="#b22234" />
      <rect y="360" width="741" height="30" fill="#b22234" />
      {/* Blue Canton */}
      <rect width="296" height="210" fill="#3c3b6e" />
      {/* Stars Grid Pattern */}
      <g fill="#ffffff">
        {[20, 56, 92, 128, 164, 200, 236, 272].map((x, xi) => (
          [20, 50, 80, 110, 140, 170, 195].map((y, yi) => (
            (xi + yi) % 2 === 0 ? (
              <circle key={`${xi}-${yi}`} cx={x} cy={y} r="6" />
            ) : null
          ))
        ))}
      </g>
    </svg>
  )
}

export default function LanguageSwitcher({ isMobile = false }) {
  const { language, setLanguage } = useLanguage()

  const options = [
    {
      code: 'pt',
      label: 'PT',
      title: 'Português (Brasil)',
      flag: <BrazilFlag className={isMobile ? "w-7 h-5" : "w-6 h-4"} />,
    },
    {
      code: 'en',
      label: 'EN',
      title: 'English (US)',
      flag: <USAFlag className={isMobile ? "w-7 h-5" : "w-6 h-4"} />,
    },
  ]

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full p-1 border transition-all duration-300 ${
        isMobile 
          ? 'bg-ink-800/90 border-white/10 w-fit' 
          : 'bg-ink-900/90 backdrop-blur-md border-white/10 hover:border-white/20'
      }`}
      role="group"
      aria-label="Language selector"
    >
      {options.map((opt) => {
        const isActive = language === opt.code
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLanguage(opt.code)}
            title={opt.title}
            aria-label={opt.title}
            aria-pressed={isActive}
            data-cursor="hover"
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
              isActive 
                ? 'text-white font-semibold' 
                : 'text-mist-900 hover:text-white opacity-75 hover:opacity-100 hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={isMobile ? "activeLanguagePillMobile" : "activeLanguagePillDesktop"}
                className="absolute inset-0 rounded-full bg-white/10 border border-signal/40 shadow-[0_0_12px_rgba(232,255,71,0.15)]"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            
            <span className="relative z-10 flex items-center gap-2">
              <span className={`transform transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'scale-100'}`}>
                {opt.flag}
              </span>
              <span className="font-mono text-xs tracking-wider">
                {opt.label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
