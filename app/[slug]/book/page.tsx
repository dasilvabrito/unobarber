import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <main className="min-h-screen text-white pb-20">
            <Header slug={slug} />

            <div className="pt-32 container mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-salon-gold mb-4">Agende seu Horário</h1>
                    <p className="text-salon-stone max-w-2xl mx-auto">
                        Escolha o serviço, o dia e o horário que melhor se adaptam à sua rotina.
                    </p>
                </div>

                <BookingForm slug={slug} />
            </div>
        </main>
    );
}
