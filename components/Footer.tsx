"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer({ slug }: { slug: string }) {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { getSettings } = await import('@/app/actions');
                const data = await getSettings(slug);
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings for footer");
            }
        };
        if (slug) fetchSettings();
    }, [slug]);

    if (!settings) return null;

    const { salonName, socialMedia, address, googleMapsUrl } = settings;

    return (
        <footer className="mt-20 py-10 border-t border-salon-brown/30 bg-salon-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 text-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-salon-stone text-sm">
                        &copy; {new Date().getFullYear()} {salonName || "Sua Barbearia"}. Todos os direitos reservados.
                    </p>
                    <Link href={`/${slug}/admin`} className="text-xs text-salon-stone/50 hover:text-salon-gold transition-colors">
                        Área Administrativa
                    </Link>
                </div>
            </div>
        </footer>
    );
}
