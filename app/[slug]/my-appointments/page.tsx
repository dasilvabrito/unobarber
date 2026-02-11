"use client";

import { useState, use } from 'react';
import Header from '@/components/Header';
import PhoneInput from '@/components/PhoneInput';

export default function MyAppointmentsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [phone, setPhone] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { getClientBookings } = await import('@/app/actions');
            const data = await getClientBookings(slug, phone);
            setBookings(data);
            setIsAuthenticated(true);
        } catch (error) {
            alert("Erro ao buscar agendamentos.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
        try {
            const { cancelBooking, getClientBookings } = await import('@/app/actions');
            await cancelBooking(slug, id);
            // Refresh list
            const data = await getClientBookings(slug, phone);
            setBookings(data);
            alert("Agendamento cancelado com sucesso!");
        } catch (error) {
            alert("Erro ao cancelar.");
        }
    };

    const isUpcoming = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-');
        const [hour, minute] = timeStr.split(':');
        const bookingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
        return bookingDate > new Date();
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen text-white pb-20">
                <Header slug={slug} />
                <div className="pt-24 container mx-auto px-4 flex justify-center pb-8">
                    <div className="bg-salon-black/50 border border-salon-gold/30 p-6 md:p-8 rounded-2xl max-w-md w-full backdrop-blur-md shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-salon-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-salon-gold/30">
                                <svg className="w-8 h-8 text-salon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Meus Agendamentos</h1>
                            <p className="text-salon-stone text-sm">Digite seu celular para acessar seus horários.</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-salon-stone mb-2 text-sm font-bold uppercase tracking-wider">Seu Telefone</label>
                                <PhoneInput
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-salon-black border border-salon-brown rounded-xl p-4 text-white text-lg focus:border-salon-gold outline-none transition-all placeholder:text-gray-600"
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-salon-gold text-salon-black font-bold py-4 rounded-xl hover:bg-white hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-lg"
                            >
                                {loading ? 'Buscando...' : '🔍 Ver Agendamentos'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white pb-20">
            <Header slug={slug} />
            <div className="pt-32 container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-salon-gold">Meus Agendamentos</h1>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-salon-stone hover:text-white"
                    >
                        Sair
                    </button>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-salon-black/30 rounded-2xl border border-salon-brown/30">
                        <p className="text-salon-stone text-xl">Você não tem agendamentos registrados.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.map((booking) => {
                            const isActive = booking.status !== 'cancelled';
                            const upcoming = isUpcoming(booking.date, booking.time);

                            return (
                                <div key={booking.id} className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-salon-black/50 border-salon-brown/50' : 'bg-red-900/10 border-red-900/30 opacity-70'}`}>
                                    <div className="flex flex-col gap-4">
                                        {/* Header: Status & Date */}
                                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                            <div className="flex items-center gap-2">
                                                {isActive ? (
                                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        Confirmado
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        Cancelado
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-salon-stone text-xs">
                                                Criado em {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>

                                        {/* Main Content: Service & Time */}
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1 leading-tight">{booking.service?.title}</h3>
                                                <p className="text-salon-stone text-sm">{booking.client.name}</p>
                                            </div>
                                            <div className="text-right bg-salon-gold/10 p-2 rounded-lg border border-salon-gold/20 min-w-[80px] flex flex-col items-center justify-center">
                                                <div className="text-salon-gold text-2xl font-bold leading-none">{booking.time}</div>
                                                <div className="text-white text-xs font-medium mt-1">{booking.date.split('-').reverse().join('/')}</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {isActive && upcoming && (
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Cancelar Agendamento
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
