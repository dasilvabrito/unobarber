"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Hero({ slug }: { slug: string }) {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { getSettings } = await import('@/app/actions');
                const data = await getSettings(slug);
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings for hero");
            }
        };
        if (slug) fetchSettings();
    }, [slug]);

    return (
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-salon-black via-[#2a1e15] to-salon-brown opacity-50 z-0"></div>
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 z-0"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <div className="mb-8 flex justify-center">
                    {settings?.logoUrl ? (
                        <img src={settings.logoUrl} alt={settings.salonName || "Salon Logo"} className="h-40 md:h-56 w-auto object-contain drop-shadow-[0_0_15px_rgba(253,218,178,0.3)] rounded-lg" />
                    ) : (
                        <h1 className="text-5xl md:text-7xl font-bold text-salon-gold mb-6 tracking-tight">
                            {settings?.salonName || "Julio Studio"}
                        </h1>
                    )}
                </div>
                <p className="text-xl md:text-2xl text-salon-stone mb-10 font-light">
                    {settings?.slogan || "Cuidando do seu visual com excelência e profissionalismo."}
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        href={`/${slug}/book`}
                        className="px-8 py-4 bg-salon-gold text-salon-black text-lg font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(253,218,178,0.3)]"
                    >
                        Agendar Horário
                    </Link>
                    <Link
                        href={`/${slug}/#services`}
                        className="px-8 py-4 border border-salon-gold text-salon-gold text-lg font-bold rounded-full hover:bg-salon-gold/10 transition-all"
                    >
                        Nossos Serviços
                    </Link>
                </div>
            </div>
        </section>
    );
}
