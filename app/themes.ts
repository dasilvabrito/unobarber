export interface Theme {
    id: string;
    name: string;
    colors: {
        gold: string;
        brown: string;
        beige: string;
        stone: string;
        black: string;
    };
}

export const themes: Theme[] = [
    {
        id: 'classic-gold',
        name: 'Clássico Dourado (Padrão)',
        colors: {
            gold: '#FDDAB2',
            brown: '#4B3829',
            beige: '#CABCAF',
            stone: '#A79F94',
            black: '#1D140D',
        },
    },
    {
        id: 'midnight-blue',
        name: 'Azul Noturno',
        colors: {
            gold: '#64ffda', // Teal accent
            brown: '#172a45',
            beige: '#8892b0',
            stone: '#ccd6f6',
            black: '#0a192f',
        },
    },
    {
        id: 'emerald-luxury',
        name: 'Esmeralda Luxo',
        colors: {
            gold: '#10b981', // Emerald
            brown: '#064e3b',
            beige: '#6ee7b7',
            stone: '#d1fae5',
            black: '#022c22',
        },
    },
    {
        id: 'royal-purple',
        name: 'Roxo Real',
        colors: {
            gold: '#d8b4fe',
            brown: '#581c87',
            beige: '#e9d5ff',
            stone: '#f3e8ff',
            black: '#3b0764',
        },
    },
    {
        id: 'ruby-red',
        name: 'Rubi Intenso',
        colors: {
            gold: '#fb7185',
            brown: '#881337',
            beige: '#fecdd3',
            stone: '#ffe4e6',
            black: '#4c0519',
        },
    },
    {
        id: 'ocean-breeze',
        name: 'Brisa do Oceano',
        colors: {
            gold: '#38bdf8',
            brown: '#0c4a6e',
            beige: '#bae6fd',
            stone: '#e0f2fe',
            black: '#082f49',
        },
    },
    {
        id: 'sunset-orange',
        name: 'Pôr do Sol',
        colors: {
            gold: '#fb923c',
            brown: '#7c2d12',
            beige: '#fdba74',
            stone: '#ffedd5',
            black: '#431407',
        },
    },
    {
        id: 'slate-minimal',
        name: 'Ardósia Minimalista',
        colors: {
            gold: '#94a3b8',
            brown: '#334155',
            beige: '#cbd5e1',
            stone: '#e2e8f0',
            black: '#0f172a',
        },
    },
    {
        id: 'rose-gold',
        name: 'Rose Gold',
        colors: {
            gold: '#fda4af',
            brown: '#881337',
            beige: '#fecdd3',
            stone: '#ffe4e6',
            black: '#4c0519',
        },
    },
    {
        id: 'forest-green',
        name: 'Verde Floresta',
        colors: {
            gold: '#84cc16',
            brown: '#365314',
            beige: '#bef264',
            stone: '#ecfccb',
            black: '#1a2e05',
        },
    },
    {
        id: 'cyber-neon',
        name: 'Cyber Neon',
        colors: {
            gold: '#f0db4f',
            brown: '#333333',
            beige: '#e0e0e0',
            stone: '#f5f5f5',
            black: '#000000',
        },
    },
    {
        id: 'coffee-shop',
        name: 'Café Expresso',
        colors: {
            gold: '#d4a373',
            brown: '#603813',
            beige: '#faedcd',
            stone: '#e9edc9',
            black: '#281b13',
        },
    },
];
