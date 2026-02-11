import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';

const services = [
  {
    title: "Corte Tradicional",
    description: "Corte clássico ou moderno, realizado com tesoura e máquina, finalizado com lavagem e modelagem.",
    price: "R$ 50,00",
    duration: "45 min"
  },
  {
    title: "Barba Completa",
    description: "Barba modelada com toalha quente e navalha, hidratação com óleos essenciais.",
    price: "R$ 40,00",
    duration: "30 min"
  },
  {
    title: "Corte + Barba",
    description: "Combo completo para renovar o visual. Inclui todos os procedimentos do corte e barba.",
    price: "R$ 80,00",
    duration: "1h 15min"
  },
  {
    title: "Sobrancelha",
    description: "Limpeza e desenho da sobrancelha com navalha ou pinça.",
    price: "R$ 20,00",
    duration: "15 min"
  },
  {
    title: "Pezinho",
    description: "Acabamento do corte e contorno.",
    price: "R$ 15,00",
    duration: "10 min"
  },
  {
    title: "Hidratação Capilar",
    description: "Tratamento profundo para recuperar a saúde e o brilho dos fios.",
    price: "R$ 45,00",
    duration: "30 min"
  }
];

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen">
      <Header slug={slug} />
      <Hero slug={slug} />

      <section id="services" className="py-20 px-4 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-salon-gold mb-4">Nossos Serviços</h2>
          <div className="w-24 h-1 bg-salon-gold mx-auto mb-6"></div>
          <p className="text-salon-stone max-w-2xl mx-auto">
            Oferecemos uma experiência completa de cuidado pessoal em um ambiente sofisticado e acolhedor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </section>

      <section id="contact" className="py-20 bg-salon-brown/20 border-t border-salon-gold/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-salon-gold mb-8">Visite-nos</h2>
          <p className="text-salon-stone mb-2">Rua Exemplo, 123 - Centro</p>
          <p className="text-salon-stone mb-6">Segunda a Sábado: 09:00 - 20:00</p>
          <a
            href="https://wa.me/5500000000000"
            className="inline-flex items-center text-salon-gold border border-salon-gold px-6 py-3 rounded-full hover:bg-salon-gold hover:text-black transition-all"
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
