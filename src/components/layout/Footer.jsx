import { Briefcase as Linkedin, MessageCircle as Twitter, Camera as Instagram, Palette as Dribbble } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-ink-950 border-t border-white/5 pt-24 pb-8" id="contact">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-24">
          
          {/* Col 1 */}
          <div className="col-span-1 border-r-0 md:border-r md:border-white/5 pr-8">
            <div className="group inline-block mb-6 relative" data-cursor="hover">
              <span className="font-display text-3xl font-bold tracking-tight text-white group-hover:text-signal transition-colors duration-500">NEXUS</span>
              <div className="absolute top-1/2 left-full ml-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 text-mist-900 text-xs text-nowrap">
                {t.footer.subtext}
              </div>
            </div>
            <p className="text-mist-900 text-sm mb-8 leading-relaxed max-w-xs whitespace-pre-line">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4 text-mist-900">
              <a href="#" className="hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/5"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Twitter size={20} /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Dribbble size={20} /></a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="col-span-1">
            <h4 className="font-mono text-xs text-signal uppercase tracking-widest mb-6">{t.footer.servicesTitle}</h4>
            <ul className="flex flex-col gap-4 text-sm text-mist-500">
              {t.footer.services.map((item, idx) => (
                <li key={idx}>
                  <a href="#services" className="hover:text-white transition-colors" data-cursor="text">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div className="col-span-1">
            <h4 className="font-mono text-xs text-signal uppercase tracking-widest mb-6">{t.footer.companyTitle}</h4>
            <ul className="flex flex-col gap-4 text-sm text-mist-500">
              {t.footer.company.map((item, idx) => (
                <li key={idx}>
                  <a href="#about" className="hover:text-white transition-colors" data-cursor="text">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div className="col-span-1">
            <h4 className="font-mono text-xs text-signal uppercase tracking-widest mb-6">{t.footer.contactTitle}</h4>
            <div className="flex flex-col gap-4 text-sm text-mist-500">
              <a href="mailto:hello@nexus.studio" className="hover:text-white transition-colors" data-cursor="hover">hello@nexus.studio</a>
              <a href="tel:+5511987654321" className="hover:text-white transition-colors" data-cursor="hover">+55 11 98765-4321</a>
              <p className="mt-4 text-mist-700 leading-relaxed">
                Av. Paulista, 1000<br/>
                São Paulo, SP - Brasil
              </p>
              <a href="#" className="text-signal hover:underline mt-2 inline-block" data-cursor="hover">View on Map →</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-mist-900">
          <p>© <span title="NEXUS Studio" className="cursor-help hover:text-signal transition-colors">2025</span> {t.footer.rights}</p>
          <p>{t.footer.madeIn} <span className="text-ember">♥</span></p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">{t.footer.privacy}</a>
            <span>·</span>
            <a href="#" className="hover:text-white">{t.footer.terms}</a>
            <span>·</span>
            <a href="#" className="hover:text-white">{t.footer.sitemap}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
