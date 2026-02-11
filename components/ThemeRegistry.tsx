"use client";

import { useEffect } from 'react';
import { themes } from '@/app/themes';

export default function ThemeRegistry({ slug }: { slug?: string }) {
    useEffect(() => {
        const applyTheme = async () => {
            try {
                if (!slug) return; // Don't fetch if no slug
                const { getSettings } = await import('@/app/actions');
                const settings = await getSettings(slug);
                const themeId = settings.currentTheme || 'classic-gold';
                const theme = themes.find(t => t.id === themeId) || themes[0];

                const root = document.documentElement;
                root.style.setProperty('--salon-gold', theme.colors.gold);
                root.style.setProperty('--salon-brown', theme.colors.brown);
                root.style.setProperty('--salon-beige', theme.colors.beige);
                root.style.setProperty('--salon-stone', theme.colors.stone);
                root.style.setProperty('--salon-black', theme.colors.black);
            } catch (error) {
                console.error("Failed to apply theme");
            }
        };

        applyTheme();

        // Listen for custom event to update theme immediately without reload
        const handleThemeChange = (e: CustomEvent) => {
            const theme = themes.find(t => t.id === e.detail.themeId);
            if (theme) {
                const root = document.documentElement;
                root.style.setProperty('--salon-gold', theme.colors.gold);
                root.style.setProperty('--salon-brown', theme.colors.brown);
                root.style.setProperty('--salon-beige', theme.colors.beige);
                root.style.setProperty('--salon-stone', theme.colors.stone);
                root.style.setProperty('--salon-black', theme.colors.black);
            }
        };

        window.addEventListener('themeChange' as any, handleThemeChange as any);
        return () => window.removeEventListener('themeChange' as any, handleThemeChange as any);

    }, []);

    return null;
}
