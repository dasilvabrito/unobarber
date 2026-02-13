"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header({ slug }: { slug: string }) {
  const [logoUrl, setLogoUrl] = useState("");
  const [socials, setSocials] = useState({ instagram: "", whatsapp: "", googleMapsUrl: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { getSettings } = await import('@/app/actions');
        const settings = await getSettings(slug);
        if (settings.logoUrl) setLogoUrl(settings.logoUrl);
        setSocials({
          instagram: settings.socialMedia?.instagram || settings.instagram || "",
          whatsapp: settings.socialMedia?.whatsapp || settings.whatsapp || "",
          googleMapsUrl: settings.googleMapsUrl || ""
        });
      } catch (error) {
        console.error("Failed to load header settings", error);
      }
    };
    if (slug) fetchSettings();
  }, [slug]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const baseUrl = `/${slug}`;

  return (
    <header className="fixed top-0 w-full z-50 bg-[#050505]/90 backdrop-blur-md border-b border-salon-brown/50 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {logoUrl ? (
          <Link href={baseUrl} className="flex items-center gap-2 group">
            <div className="relative overflow-hidden rounded-md border border-salon-gold/20 group-hover:border-salon-gold/50 transition-colors">
              <img
                src={logoUrl}
                alt="Logo da Barbearia"
                className="h-12 w-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </Link>
        ) : (
          <div /> /* Spacer or Empty to keep layout if needed, or just nothing */
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={baseUrl} className="text-salon-beige hover:text-salon-gold transition-colors font-medium">
              Agendar
            </Link>
            <Link href={`${baseUrl}/my-appointments`} className="text-salon-beige hover:text-salon-gold transition-colors font-medium">
              Meus Agendamentos
            </Link>
            <div className="h-4 w-px bg-salon-brown/50 mx-2"></div>
          </nav>

          {/* Social Icons - Always Visible */}
          <div className="flex items-center gap-3 sm:gap-4">
            {socials.googleMapsUrl && (
              <a href={socials.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-salon-beige hover:text-blue-500 transition-colors" title="Como Chegar">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              </a>
            )}

            {socials.instagram && (
              <a href={socials.instagram.startsWith('http') ? socials.instagram : `https://instagram.com/${socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-salon-beige hover:text-pink-500 transition-colors" title="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>
              </a>
            )}

            {socials.whatsapp && (
              <a href={`https://wa.me/55${socials.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-salon-beige hover:text-green-500 transition-colors" title="WhatsApp">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-salon-gold focus:outline-none"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#050505]/95 backdrop-blur-xl border-b border-salon-gold/20 absolute w-full left-0 top-16 shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <nav className="flex flex-col p-6 space-y-4">
            <Link
              href={baseUrl}
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-medium text-white hover:text-salon-gold py-2 border-b border-white/5"
            >
              📅 Agendar Horário
            </Link>
            <Link
              href={`${baseUrl}/my-appointments`}
              onClick={() => setIsMenuOpen(false)}
              className="text-xl font-medium text-salon-gold py-2 border-b border-white/5"
            >
              🔍 Meus Agendamentos
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
