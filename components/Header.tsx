"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header({ slug }: { slug: string }) {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { getSettings } = await import('@/app/actions');
        const settings = await getSettings(slug);
        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error("Failed to load header settings", error);
      }
    };
    if (slug) fetchSettings();
  }, [slug]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const baseUrl = `/${slug}`;

  return (
    <header className="fixed top-0 w-full z-50 bg-salon-black/90 backdrop-blur-md border-b border-salon-brown/50 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={baseUrl} className="flex items-center gap-2 group">
          <div className="relative overflow-hidden rounded-md border border-salon-gold/20 group-hover:border-salon-gold/50 transition-colors">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo da Barbearia"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'; // Hide if fails
                }}
              />
            ) : (
              <span className="text-xl font-bold text-salon-gold px-2">Sua Barbearia</span>
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href={baseUrl} className="text-salon-beige hover:text-salon-gold transition-colors font-medium">
            Agendar
          </Link>
          <Link href={`${baseUrl}/my-appointments`} className="text-salon-beige hover:text-salon-gold transition-colors font-medium">
            Meus Agendamentos
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
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

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-salon-black/95 backdrop-blur-xl border-b border-salon-gold/20 absolute w-full left-0 top-16 shadow-2xl animate-in slide-in-from-top-5 duration-300">
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
