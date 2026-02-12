import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { getSettings } = await import('@/app/actions');
  const settings = await getSettings(slug);

  return (
    <main className="min-h-screen text-white pb-20 bg-salon-black">
      <Header slug={slug} />

      <div className="pt-32 container mx-auto px-4">
        <div className="text-center mb-10 flex flex-col items-center">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.salonName}
              className="h-32 md:h-40 w-auto object-contain mb-6 drop-shadow-[0_0_15px_rgba(253,218,178,0.3)] animate-in fade-in zoom-in duration-700"
            />
          ) : (
            <h1 className="text-4xl md:text-6xl font-bold text-salon-gold mb-4 tracking-tight">
              {settings.salonName || "Sua Barbearia"}
            </h1>
          )}

        </div>

        <BookingForm slug={slug} />
      </div>
    </main>
  );
}
