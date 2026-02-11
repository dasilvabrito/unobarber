interface ServiceCardProps {
    title: string;
    description?: string;
    price: string | number;
    duration: string;
}

export default function ServiceCard({ title, price, duration, description }: ServiceCardProps) {
    const formattedPrice = typeof price === 'number'
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
        : price;

    return (
        <div className="bg-salon-black/50 border border-salon-brown p-6 rounded-xl hover:border-salon-gold transition-all group backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-salon-gold transition-colors">{title}</h3>
                </div>
                <span className="text-salon-gold font-bold text-lg">{formattedPrice}</span>
            </div>
            {description && (
                <p className="text-salon-stone mb-4 text-sm leading-relaxed">
                    {description}
                </p>
            )}
            <div className="flex items-center text-salon-beige text-xs">
                <svg className="w-4 h-4 mr-1 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration}
            </div>
        </div>
    );
}
