import Link from "next/link";
import {
  InstagramLogo,
  FacebookLogo,
  YoutubeLogo,
  TiktokLogo,
  ArrowRight,
  Phone,
  Envelope,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";

const FOOTER_LINKS = {
  Platformă: [
    { href: "/biblioteca", label: "Bibliotecă practici" },
    { href: "/sesiuni-live", label: "Sesiuni Live" },
    { href: "/facilitatori", label: "Facilitatori" },
    { href: "/preturi", label: "Prețuri" },
  ],
  Companie: [
    { href: "/despre-noi", label: "Despre noi" },
    { href: "/blog", label: "Blog" },
    { href: "/facilitatori", label: "Devino facilitator" },
    { href: "#", label: "Parteneriate B2B" },
  ],
  Legal: [
    { href: "#", label: "Termeni și condiții" },
    { href: "#", label: "Politica de confidențialitate" },
    { href: "#", label: "Politica cookies" },
    { href: "#", label: "GDPR" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-deep-green text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-forest-green rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-heading font-bold">I</span>
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">INAUNTRU</span>
            </div>
            <p className="font-body text-body-sm text-white/70 mb-6 leading-relaxed max-w-sm">
              Prima platformă de terapie somatică digitală din România. Practici bazate pe știință pentru echilibrul tău interior.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="font-body text-label-sm text-white/50 uppercase tracking-widest mb-3">
                Newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email-ul tău"
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-body-sm text-white placeholder-white/40 font-body focus:outline-none focus:border-forest-green transition-colors"
                />
                <button className="w-10 h-10 bg-forest-green rounded-full flex items-center justify-center flex-shrink-0 hover:bg-opacity-80 transition-colors">
                  <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: InstagramLogo, href: "#", label: "Instagram" },
                { icon: FacebookLogo, href: "#", label: "Facebook" },
                { icon: YoutubeLogo, href: "#", label: "YouTube" },
                { icon: TiktokLogo, href: "#", label: "TikTok" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-forest-green transition-colors"
                >
                  <Icon size={16} weight="fill" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-body text-label-sm text-white/50 uppercase tracking-widest mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-body-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Crisis note — always visible */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Phone size={16} weight="fill" className="text-rose-powder mt-0.5 flex-shrink-0" />
            <p className="font-body text-body-sm text-white/60">
              <span className="text-rose-powder font-semibold">Linie de criză:</span>{" "}
              Dacă ești în criză, nu folosi această platformă. Sună la{" "}
              <a href="tel:0800801200" className="text-rose-powder font-semibold hover:underline">
                0800 801 200
              </a>{" "}
              (gratuit, 24/7)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-body-sm text-white/40">
              © 2026 INAUNTRU. Toate drepturile rezervate.
            </p>

            {/* Badges */}
            <div className="flex items-center gap-4">
              {/* ANPC badge placeholder */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <div className="w-4 h-4 bg-white/40 rounded" />
                <span className="font-body text-label-xs text-white/60">ANPC</span>
              </div>

              {/* Payment badges */}
              <div className="flex items-center gap-2">
                <div className="bg-white/10 rounded px-2 py-1">
                  <span className="font-body text-label-xs text-white/60 font-bold">VISA</span>
                </div>
                <div className="bg-white/10 rounded px-2 py-1">
                  <span className="font-body text-label-xs text-white/60 font-bold">MC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
