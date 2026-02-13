"use client";

import { useState, useEffect, use } from 'react';
import { themes } from '@/app/themes';
import PhoneInput from '@/components/PhoneInput';

export default function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'style' | 'settings' | 'team' | 'financial'>('bookings');
    const [services, setServices] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [editingService, setEditingService] = useState<any>(null);
    const [editingProfessional, setEditingProfessional] = useState<any>(null);
    const [subscriptionData, setSubscriptionData] = useState<any>(null);
    const [financialMonth, setFinancialMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const [settings, setSettings] = useState<any>({ startHour: "", endHour: "", salonName: "", logoUrl: "", socialMedia: { facebook: "", instagram: "", whatsapp: "" } });

    // Follow-Up System State
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        today: 0,
        month: 0,
        pendingFollowUps: 0
    });
    const [finishingBooking, setFinishingBooking] = useState<string | null>(null);
    const [finishPrice, setFinishPrice] = useState<number>(0);
    const [finishProductsPrice, setFinishProductsPrice] = useState<number>(0);

    // Financial State
    const [financialStartDate, setFinancialStartDate] = useState(new Date().toISOString().slice(0, 8) + '01'); // First day of month
    const [financialEndDate, setFinancialEndDate] = useState(new Date().toISOString().slice(0, 10)); // Today
    const [financialReport, setFinancialReport] = useState<{ bookings: any[], payments: any[] }>({ bookings: [], payments: [] });
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentProfessional, setPaymentProfessional] = useState<any>(null);
    const [statementProfessional, setStatementProfessional] = useState<any>(null); // For Detailed Statement
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [paymentNote, setPaymentNote] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { getBookings, getSettings, getServices, getProfessionals } = await import('@/app/actions');
            const [bookingsData, settingsData, servicesData, professionalsData] = await Promise.all([
                getBookings(slug),
                getSettings(slug),
                getServices(slug),
                getProfessionals(slug)
            ]);

            bookingsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setBookings(bookingsData);
            setSettings(settingsData);
            setServices(servicesData);
            setProfessionals(professionalsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        if (filter === 'today') return b.date === new Date().toISOString().split('T')[0];
        if (filter === 'upcoming') return new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0));
        return true;
    });

    // Follow Up List Logic
    const followUps = bookings.filter(b => {
        if (b.status !== 'completed' || !b.followUp || b.followUp.sent) return false;
        const today = new Date().toISOString().split('T')[0];
        return b.followUp.scheduledDate <= today;
    });

    // Calculate Stats
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled').length;
        const monthCount = bookings.filter(b => b.date.startsWith(todayStr.substring(0, 7)) && b.status !== 'cancelled').length;

        setStats({
            today: todayCount,
            month: monthCount,
            pendingFollowUps: followUps.length
        });
    }, [bookings]);

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        // Optimization: update local state immediately
        const newBookings = bookings.map(b =>
            b.id === bookingId ? { ...b, status: newStatus } : b
        );
        setBookings(newBookings);

        if (newStatus === 'cancelled') {
            const { cancelBooking } = await import('@/app/actions');
            await cancelBooking(slug, bookingId);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ... (rest of useEffects/fetchData remain same, assuming they are outside this block or I need to be careful with range)

    // Wait, I need to insert state near other states. 
    // And update handleComplete.

    // Let's do it in chunks.
    // This tool call is for state and handleComplete.

    // I can't double declare existing states.
    // I will target the finishingBooking line to add finishPrice below it.
    // And replace handleComplete.

    // ... re-reading the file content to be precise. 
    // Line 29 is: const [finishingBooking, setFinishingBooking] = useState<string | null>(null);
    // Line 98 is start of handleComplete.

    const handleComplete = async (days: number) => {
        if (!finishingBooking) return;

        const { completeBooking } = await import('@/app/actions');
        // Pass the finishPrice to the action
        await completeBooking(slug, finishingBooking, days, finishPrice, finishProductsPrice);

        // Update Local State
        setBookings(bookings.map(b =>
            b.id === finishingBooking
                ? {
                    ...b,
                    status: 'completed',
                    service: { ...b.service, price: finishPrice }, // Update local price for immediate feedback
                    followUp: days > 0 ? {
                        scheduledDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        days: days,
                        sent: false
                    } : null
                }
                : b
        ));
        setFinishingBooking(null);
    };

    const generateWhatsAppLink = (booking: any) => {
        const phone = booking.client.phone.replace(/\D/g, '');
        const firstName = booking.client.name.split(' ')[0];
        // Creative Messages based on days
        const days = booking.followUp?.days || 30;
        let text = "";

        if (days <= 20) text = `Fala ${firstName}! 😎 Já faz 20 dias do talento. Bora manter o corte na régua? 📏 Agende aqui: unobarber.com/${slug}`;
        else if (days <= 25) text = `E aí ${firstName}! Passando pra avisar que já deu 25 dias. O cabelo já deve estar pedindo socorro! 😂 Bora agendar? unobarber.com/${slug}`;
        else text = `Salve ${firstName}! 30 dias se passaram... Não deixa virar o "Náufrago" não! 🧔‍♂️ Vem dar um tapa no visual! unobarber.com/${slug}`;

        return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
    };

    const handleDismissFollowUp = async (bookingId: string) => {
        // Optimistic update: remove from current view
        const newBookings = bookings.map(b =>
            b.id === bookingId ? { ...b, followUp: { ...b.followUp, sent: true } } : b
        );
        setBookings(newBookings);

        const { dismissFollowUp } = await import('@/app/actions');
        await dismissFollowUp(slug, bookingId);
    };

    // Fetch Subscription & Financial Data
    useEffect(() => {
        if (activeTab === 'financial') {
            const fetchFinancial = async () => {
                const { getSystemSubscription, getFinancialReport } = await import('@/app/actions');
                const [subData, reportData] = await Promise.all([
                    getSystemSubscription(slug),
                    getFinancialReport(slug, financialStartDate, financialEndDate)
                ]);
                setSubscriptionData(subData);
                setFinancialReport(reportData);
            };
            fetchFinancial();
        }
    }, [activeTab, slug, financialStartDate, financialEndDate]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { saveSettings } = await import('@/app/actions');
            await saveSettings(slug, settings);
            alert("Configurações salvas!");
        } catch (error) {
            alert("Erro ao salvar configurações");
        }
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { saveService } = await import('@/app/actions');
            await saveService(slug, editingService);
            setEditingService(null);
            fetchData();
            alert("Serviço salvo!");
        } catch (error) {
            alert("Erro ao salvar serviço");
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            const { deleteService } = await import('@/app/actions');
            await deleteService(slug, id);
            fetchData();
        } catch (error) {
            alert("Erro ao excluir serviço");
        }
    };

    const handleSaveProfessional = async (e: React.FormEvent, pro: any, serviceIds: string[] = []) => {
        e.preventDefault();
        try {
            const { saveProfessional, updateProfessionalServices } = await import('@/app/actions');
            await saveProfessional(slug, pro);

            // If we are saving, we should also update the services if provided
            // For new pros, pro.id is generated in backend, so we might miss it here if we don't refetch or handle it.
            // But saveProfessional generates ID if missing.
            // Ideally saveProfessional should return the ID. 
            // For now, let's assume we are editing existing pros mostly for this feature, or we rely on the name/logic.
            // Actually, we can't easily link services to a NEW pro without the ID.
            // So we might need to change saveProfessional to return the ID.
            // Let's assume for now we only support linking for EXISTING pros or we handle it by refreshing.

            if (pro.id) {
                await updateProfessionalServices(slug, pro.id, serviceIds);
            }

            alert("Profissional salvo!");
            setEditingProfessional(null);
            fetchData();
        } catch (error) {
            alert("Erro ao salvar profissional");
        }
    };

    const handleDeleteProfessional = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este profissional?")) return;
        try {
            const { deleteProfessional } = await import('@/app/actions');
            await deleteProfessional(slug, id);
            fetchData();
        } catch (error) {
            alert("Erro ao remover profissional");
        }
    };

    const handleRegisterPayment = async () => {
        if (!paymentProfessional || !paymentAmount) return;
        try {
            const { registerProfessionalPayment } = await import('@/app/actions');
            await registerProfessionalPayment(slug, paymentProfessional.id, parseFloat(paymentAmount), paymentNote);
            setPaymentModalOpen(false);
            setPaymentAmount('');
            setPaymentNote('');
            setPaymentProfessional(null);

            // Refresh Report
            const { getFinancialReport } = await import('@/app/actions');
            const reportData = await getFinancialReport(slug, financialStartDate, financialEndDate);
            setFinancialReport(reportData);
            alert("Pagamento registrado!");
        } catch (error) {
            alert("Erro ao registrar pagamento");
        }
    };

    return (
        <div>
            {/* <h1 className="text-3xl font-bold text-salon-gold mb-8">Painel Administrativo</h1> -- Layout has header */}

            {/* Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide border-b border-salon-brown/30">
                {[
                    { id: 'bookings', label: '📅 Agendamentos' },
                    { id: 'team', label: '💈 Equipe' },
                    { id: 'services', label: '✂️ Serviços' },
                    { id: 'financial', label: '💰 Financeiro' },
                    { id: 'settings', label: '⚙️ Configurações' },
                    { id: 'style', label: '🎨 Estilo' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium ${activeTab === tab.id
                            ? 'bg-salon-gold text-salon-black shadow-lg shadow-salon-gold/20'
                            : 'text-salon-stone hover:bg-salon-brown/30 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {
                activeTab === 'services' && (
                    <div className="space-y-8">
                        {/* Service List & Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Serviços Ativos</h2>
                                <div className="space-y-4">
                                    {services.map(service => (
                                        <div key={service.id} className={`p-4 rounded-lg border flex justify-between items-center group transition-all ${service.active !== false ? 'bg-salon-black/50 border-salon-brown/30 hover:border-salon-gold/50' : 'bg-red-900/10 border-red-900/20 opacity-60'}`}>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{service.title}</h3>
                                                    {service.active === false && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20">INATIVO</span>}
                                                    {service.type === 'combo' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">COMBO</span>}
                                                    {service.discountPrice && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">PROMO</span>}
                                                </div>
                                                <div className="text-salon-stone text-sm mt-1">
                                                    {service.duration} •
                                                    {service.discountPrice ? (
                                                        <span className="ml-1">
                                                            <span className="line-through opacity-50 mr-1">R$ {service.price}</span>
                                                            <span className="text-green-400 font-bold">R$ {service.discountPrice}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="ml-1 text-salon-gold">R$ {service.price}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        // Quick toggle
                                                        const newStatus = service.active === false; // Toggle
                                                        const updatedService = { ...service, active: newStatus };
                                                        // Optimistic update
                                                        const updatedList = services.map(s => s.id === service.id ? updatedService : s);
                                                        setServices(updatedList);

                                                        const { saveService } = await import('@/app/actions');
                                                        await saveService(slug, updatedService);
                                                    }}
                                                    className={`p-2 rounded ${service.active !== false ? 'text-green-500 hover:bg-green-500/10' : 'text-salon-stone hover:bg-white/10'}`}
                                                    title={service.active !== false ? "Desativar" : "Ativar"}
                                                >
                                                    {service.active !== false ? '✅' : '🚫'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingService(service)}
                                                    className="p-2 text-salon-gold hover:bg-salon-gold/10 rounded"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteService(service.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setEditingService({ title: '', price: '', duration: '30 min', type: 'service', active: true })}
                                        className="w-full py-3 border-2 border-dashed border-salon-brown/50 rounded-lg text-salon-stone hover:border-salon-gold hover:text-salon-gold transition-all"
                                    >
                                        + Adicionar Novo Serviço
                                    </button>
                                </div>
                            </div>

                            {/* Edit/Add Form */}
                            {editingService && (
                                <div className="bg-salon-black/80 border border-salon-gold/50 p-6 rounded-xl h-fit sticky top-32">
                                    <h2 className="text-xl font-bold text-white mb-4">
                                        {editingService.id ? 'Editar Serviço' : 'Novo Serviço'}
                                    </h2>
                                    <form onSubmit={handleSaveService} className="space-y-4">
                                        <div>
                                            <label className="block text-salon-stone text-sm mb-1">Título</label>
                                            <input
                                                className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                                value={editingService.title}
                                                onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-salon-stone text-sm mb-1">Preço (R$)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                                    value={editingService.price}
                                                    onChange={e => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-salon-stone text-sm mb-1">Duração</label>
                                                <select
                                                    className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                                    value={editingService.duration}
                                                    onChange={e => setEditingService({ ...editingService, duration: e.target.value })}
                                                >
                                                    <option value="15 min">15 min</option>
                                                    <option value="30 min">30 min</option>
                                                    <option value="45 min">45 min</option>
                                                    <option value="1h">1h</option>
                                                    <option value="1h 30min">1h 30min</option>
                                                    <option value="2h">2h</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2 p-3 bg-salon-white/5 rounded border border-salon-white/10 flex-1">
                                                <input
                                                    type="checkbox"
                                                    id="isCombo"
                                                    checked={editingService.type === 'combo'}
                                                    onChange={e => setEditingService({ ...editingService, type: e.target.checked ? 'combo' : 'service' })}
                                                    className="w-4 h-4 accent-salon-gold"
                                                />
                                                <label htmlFor="isCombo" className="text-white text-sm cursor-pointer">É um Combo?</label>
                                            </div>
                                            <div className="flex items-center gap-2 p-3 bg-salon-white/5 rounded border border-salon-white/10 flex-1">
                                                <input
                                                    type="checkbox"
                                                    id="isActive"
                                                    checked={editingService.active !== false}
                                                    onChange={e => setEditingService({ ...editingService, active: e.target.checked })}
                                                    className="w-4 h-4 accent-salon-gold"
                                                />
                                                <label htmlFor="isActive" className="text-white text-sm cursor-pointer">Ativo?</label>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-green-900/10 rounded border border-green-500/20">
                                            <label className="block text-green-400 text-sm mb-1">Preço Promocional (Opcional)</label>
                                            <input
                                                type="number"
                                                placeholder="Deixe vazio se não houver desconto"
                                                className="w-full bg-salon-black border border-green-900 rounded p-2 text-white focus:border-green-500 outline-none"
                                                value={editingService.discountPrice || ''}
                                                onChange={e => setEditingService({ ...editingService, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                            />
                                            <p className="text-[10px] text-salon-stone mt-1">Se preenchido, aparecerá como oferta.</p>
                                        </div>

                                        <div className="p-3 bg-salon-white/5 rounded border border-salon-white/10">
                                            <label className="block text-salon-stone text-sm mb-2">Profissionais Habilitados</label>
                                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                {professionals.filter(p => p.active !== false).map(pro => (
                                                    <div key={pro.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!editingService.allowedProfessionals || editingService.allowedProfessionals.includes(pro.id)}
                                                            onChange={(e) => {
                                                                const current = editingService.allowedProfessionals || [];
                                                                let updated;
                                                                if (e.target.checked) {
                                                                    // Add
                                                                    updated = [...current, pro.id];
                                                                    // If all are selected (or none explicitly restricted), we could potentialy semantic optimization, but let's keep it explicit for now.
                                                                    // Actually, let's treat "empty" as "all" for backward compat, but here we deal with explicit list.
                                                                    // If previously undefined/empty (meaning ALL), and we uncheck one, we must start with ALL and remove one.
                                                                    if (current.length === 0 && !editingService.allowedProfessionals) {
                                                                        // It was "ALL", now we checked one? No, this logic is tricky.
                                                                        // Let's simplify: 
                                                                        // If `allowedProfessionals` is undefined/null/empty array => ALL ARE ALLOWED.
                                                                        // The UI should reflect "All checked".
                                                                        // If user Unchecks one, we strictly set the array to [all_others].
                                                                    }
                                                                } else {
                                                                    // Remove
                                                                    // If we are removing from an "All Allowed" state (undefined/empty), we first need to populate with ALL IDs, then remove this one.
                                                                    if (!editingService.allowedProfessionals || editingService.allowedProfessionals.length === 0) {
                                                                        const allIds = professionals.filter(p => p.active !== false).map(p => p.id);
                                                                        updated = allIds.filter(id => id !== pro.id);
                                                                    } else {
                                                                        updated = current.filter((id: string) => id !== pro.id);
                                                                    }
                                                                }

                                                                // If we ended up selecting ALL again, maybe clear the array to mean "Any"? 
                                                                // Or just keep explicit. Explicit is safer for now.
                                                                setEditingService({ ...editingService, allowedProfessionals: updated });
                                                            }}
                                                            className="w-4 h-4 accent-salon-gold"
                                                        />
                                                        <span className="text-white text-sm">{pro.name}</span>
                                                    </div>
                                                ))}
                                                {professionals.length === 0 && <p className="text-xs text-salon-stone">Nenhum profissional cadastrado.</p>}
                                            </div>
                                            <p className="text-[10px] text-salon-stone mt-2">Se nenhum for selecionado, todos estarão habilitados (padrão).</p>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingService(null)}
                                                className="flex-1 py-2 rounded text-salon-stone hover:bg-white/5"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-2 rounded bg-salon-gold text-salon-black font-bold hover:bg-white"
                                            >
                                                Salvar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'bookings' && (
                    <>
                        {/* Dashboard Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-salon-black border border-salon-gold/20 p-6 rounded-xl">
                                <h3 className="text-salon-stone text-sm uppercase tracking-wider mb-2">Agendamentos (Hoje)</h3>
                                <div className="text-3xl font-bold text-white">{stats.today}</div>
                            </div>
                            <div className="bg-salon-black border border-salon-gold/20 p-6 rounded-xl">
                                <h3 className="text-salon-stone text-sm uppercase tracking-wider mb-2">Faturamento (Hoje)</h3>
                                <div className="text-3xl font-bold text-green-400">R$ {bookings.filter(b => b.date === new Date().toISOString().split('T')[0] && b.status !== 'cancelled').reduce((acc, curr) => acc + curr.service.price, 0)},00</div>
                            </div>
                            <div className="bg-salon-black border border-salon-gold/20 p-6 rounded-xl">
                                <h3 className="text-salon-stone text-sm uppercase tracking-wider mb-2">Retornos Pendentes</h3>
                                <div className="text-3xl font-bold text-blue-400">{stats.pendingFollowUps}</div>
                            </div>
                        </div>

                        {/* Follow Up Section (If there are pending) */}
                        {followUps.length > 0 && (
                            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-blue-400">📢</span> Clientes para Avisar Hoje
                                </h2>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl overflow-hidden">
                                    {followUps.map((booking) => (
                                        <div key={booking.id} className="p-4 border-b border-blue-500/10 flex justify-between items-center last:border-0 hover:bg-blue-500/5 transition-colors">
                                            <div>
                                                <div className="font-bold text-white">{booking.client.name}</div>
                                                <div className="text-sm text-blue-300">Último corte: {new Date(booking.date).toLocaleDateString('pt-BR')} ({booking.followUp?.days} dias atrás)</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleDismissFollowUp(booking.id)}
                                                    className="bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-all text-sm"
                                                    title="Dispensar Aviso"
                                                >
                                                    ✕
                                                </button>
                                                <a
                                                    href={generateWhatsAppLink(booking)}
                                                    target="_blank"
                                                    onClick={() => handleDismissFollowUp(booking.id)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition-all flex items-center gap-2 text-sm shadow-lg shadow-green-500/20"
                                                >
                                                    <span>Enviar WhatsApp</span>
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Agendamentos</h2>
                            <button
                                onClick={fetchData}
                                className="text-salon-gold border border-salon-gold px-4 py-2 rounded-lg hover:bg-salon-gold/10 transition-colors flex items-center gap-2"
                            >
                                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0016.357-2m0 0H15" />
                                </svg>
                                Atualizar Lista
                            </button>
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-20 bg-salon-black/30 rounded-2xl border border-salon-brown/30">
                                <p className="text-salon-stone text-xl">Nenhum agendamento encontrado.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredBookings.map((booking) => {
                                    const isActive = booking.status !== 'cancelled';

                                    return (
                                        <div key={booking.id} className={`rounded-xl p-6 transition-all border ${isActive ? 'bg-salon-black/50 border-salon-brown/50 hover:border-salon-gold/50' : 'bg-red-900/10 border-red-900/30 opacity-60'}`}>
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {booking.status === 'confirmed' && (
                                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                                Confirmado
                                                            </span>
                                                        )}
                                                        {booking.status === 'completed' && (
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                                    Concluído {booking.followUp && `(Retorno: ${booking.followUp.days}d)`}
                                                                </span>
                                                                {(booking.service.price > 0 || booking.products_price > 0) && (
                                                                    <span className="text-xs text-salon-stone font-mono">
                                                                        Valores: {booking.service.price > 0 && `S:${booking.service.price.toFixed(2)}`} {booking.products_price > 0 && `P:${booking.products_price.toFixed(2)}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {booking.status === 'cancelled' && (
                                                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                                Cancelado
                                                            </span>
                                                        )}
                                                        <span className="bg-salon-gold/20 text-salon-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                            {booking.service?.title || 'Serviço Desconhecido'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-1">{booking.client.name}</h3>
                                                    <p className="text-salon-stone text-sm flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        {booking.client.phone}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-end min-w-[150px]">
                                                    <div className="text-right mb-2">
                                                        <div className="text-salon-gold text-2xl font-bold">{booking.time}</div>
                                                        <div className="text-white text-lg font-medium">{booking.date.split('-').reverse().join('/')}</div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {booking.status === 'confirmed' && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setFinishingBooking(booking.id);
                                                                        setFinishPrice(booking.service?.price || 0);
                                                                    }}
                                                                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors border border-green-500/30"
                                                                    title="Concluir Atendimento"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm("Cancelar agendamento?")) return;
                                                                        await handleStatusChange(booking.id, 'cancelled');
                                                                    }}
                                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
                                                                    title="Cancelar"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )
            }

            {/* MODAL: Complete Booking & Schedule Follow Up */}
            {
                finishingBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-salon-black border border-salon-gold/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                            <h3 className="text-xl font-bold text-white mb-2">Encerrar Atendimento</h3>
                            <p className="text-salon-stone mb-4">Confirme o valor final e agende o retorno.</p>

                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-salon-stone text-xs mb-1">Serviço (Comissão)</label>
                                    <input
                                        type="number"
                                        value={finishPrice}
                                        onChange={(e) => setFinishPrice(parseFloat(e.target.value))}
                                        className="w-full bg-salon-black border border-salon-gold/50 rounded-lg p-3 text-white text-lg font-bold focus:border-salon-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone text-xs mb-1">Produtos (Extra)</label>
                                    <input
                                        type="number"
                                        value={finishProductsPrice}
                                        onChange={(e) => setFinishProductsPrice(parseFloat(e.target.value))}
                                        className="w-full bg-salon-black border border-salon-gold/50 rounded-lg p-3 text-white text-lg font-bold focus:border-salon-gold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-6">
                                <p className="text-xs text-salon-stone font-bold uppercase tracking-wider mb-2">Agendar Retorno (Lembrete)</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => handleComplete(20)} className="bg-salon-gold/10 hover:bg-salon-gold hover:text-black border border-salon-gold/30 text-salon-gold py-2 rounded-lg transition-all font-bold text-sm">
                                        20 Dias
                                    </button>
                                    <button onClick={() => handleComplete(25)} className="bg-salon-gold/10 hover:bg-salon-gold hover:text-black border border-salon-gold/30 text-salon-gold py-2 rounded-lg transition-all font-bold text-sm">
                                        25 Dias
                                    </button>
                                    <button onClick={() => handleComplete(30)} className="bg-salon-gold/10 hover:bg-salon-gold hover:text-black border border-salon-gold/30 text-salon-gold py-2 rounded-lg transition-all font-bold text-sm">
                                        30 Dias
                                    </button>
                                </div>
                                <button onClick={() => handleComplete(0)} className="mt-2 w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-all border border-white/10 text-sm">
                                    Encerrar sem Agendar Retorno
                                </button>
                            </div>

                            <button onClick={() => setFinishingBooking(null)} className="absolute top-4 right-4 text-salon-stone hover:text-white">
                                ✕
                            </button>
                        </div>
                    </div>
                )
            }
            {
                activeTab === 'financial' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Header & Filter */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-salon-black/50 p-6 rounded-xl border border-salon-gold/20 print:border-none print:shadow-none print:bg-white print:p-0">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 print:text-black">Relatório Financeiro</h2>
                                <p className="text-salon-stone text-sm print:text-gray-600">Acompanhe comissões, faturamento e pagamentos.</p>
                            </div>
                            <div className="flex gap-4 items-end print:hidden">
                                <div>
                                    <label className="block text-salon-stone text-xs mb-1">Início</label>
                                    <input
                                        type="date"
                                        value={financialStartDate}
                                        onChange={(e) => setFinancialStartDate(e.target.value)}
                                        className="bg-salon-black border border-salon-brown rounded px-3 py-2 text-white outline-none focus:border-salon-gold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone text-xs mb-1">Fim</label>
                                    <input
                                        type="date"
                                        value={financialEndDate}
                                        onChange={(e) => setFinancialEndDate(e.target.value)}
                                        className="bg-salon-black border border-salon-brown rounded px-3 py-2 text-white outline-none focus:border-salon-gold"
                                    />
                                </div>
                                <button
                                    onClick={() => window.print()}
                                    className="bg-salon-gold/20 text-salon-gold px-4 py-2 rounded-lg hover:bg-salon-gold/30 transition-colors flex items-center gap-2 font-bold"
                                >
                                    🖨️ Imprimir
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                            <div className="bg-salon-black border border-salon-brown/50 p-4 rounded-xl print:bg-white print:border-gray-200">
                                <h3 className="text-salon-stone text-xs uppercase tracking-wider mb-2 print:text-gray-500">Faturamento Total</h3>
                                <div className="text-2xl font-bold text-green-400 print:text-black">
                                    R$ {financialReport.bookings.reduce((acc, b) => acc + (b.service_price || 0) + (b.products_price || 0), 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-salon-stone mt-1 print:text-gray-500">Serviços + Produtos</div>
                            </div>
                            <div className="bg-salon-black border border-salon-brown/50 p-4 rounded-xl print:bg-white print:border-gray-200">
                                <h3 className="text-salon-stone text-xs uppercase tracking-wider mb-2 print:text-gray-500">Comissão Gerada</h3>
                                <div className="text-2xl font-bold text-salon-gold print:text-black">
                                    R$ {financialReport.bookings.reduce((acc, b) => {
                                        // Calculate commission based on snapshot or current pro settings
                                        // We fetched professionals with commission_percentage in getFinancialReport
                                        // Actually getFinancialReport returned bookings with joined professional
                                        const pro = b.professional;
                                        const commissionRate = pro?.commission_percentage || 100;
                                        const commissionValue = (b.service_price || 0) * (commissionRate / 100);
                                        return acc + commissionValue;
                                    }, 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-salon-stone mt-1 print:text-gray-500">Ref. aos Profissionais</div>
                            </div>
                            <div className="bg-salon-black border border-salon-brown/50 p-4 rounded-xl print:bg-white print:border-gray-200">
                                <h3 className="text-salon-stone text-xs uppercase tracking-wider mb-2 print:text-gray-500">Venda de Produtos</h3>
                                <div className="text-2xl font-bold text-blue-400 print:text-black">
                                    R$ {financialReport.bookings.reduce((acc, b) => acc + (b.products_price || 0), 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-salon-stone mt-1 print:text-gray-500">100% Salão</div>
                            </div>
                            <div className="bg-salon-black border border-salon-brown/50 p-4 rounded-xl print:bg-white print:border-gray-200">
                                <h3 className="text-salon-stone text-xs uppercase tracking-wider mb-2 print:text-gray-500">Pagamentos Realizados</h3>
                                <div className="text-2xl font-bold text-red-400 print:text-black">
                                    R$ {financialReport.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-salon-stone mt-1 print:text-gray-500">Neste período</div>
                            </div>
                        </div>

                        {/* Professionals Balance Table */}
                        <div className="bg-salon-black/50 border border-salon-brown/30 rounded-xl overflow-hidden print:bg-white print:border-gray-200">
                            <div className="p-4 border-b border-salon-brown/30 bg-salon-white/5 print:bg-gray-50 print:border-gray-200">
                                <h3 className="font-bold text-white print:text-black">Carteira dos Profissionais</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-salon-stone uppercase bg-salon-black/50 print:bg-gray-100 print:text-black">
                                        <tr>
                                            <th className="p-4">Profissional</th>
                                            <th className="p-4 text-right">Comissão (%)</th>
                                            <th className="p-4 text-right">Produção (R$)</th>
                                            <th className="p-4 text-right">Comissão (R$)</th>
                                            <th className="p-4 text-right">Pagos (Período)</th>
                                            <th className="p-4 text-right">Saldo (Estimado)</th>
                                            <th className="p-4 text-center print:hidden">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-salon-brown/20">
                                        {professionals.filter(p => p.active !== false).map(pro => {
                                            // Calculate Metrics for this Pro
                                            // 1. Production (Service Price Total for this Pro)
                                            const proBookings = financialReport.bookings.filter(b => b.professional_id === pro.id || b.professional_name === pro.name);
                                            const production = proBookings.reduce((acc, b) => acc + (b.service_price || 0), 0);

                                            // 2. Commission
                                            const commissionRate = pro.commissionPercentage || 100;
                                            const commission = production * (commissionRate / 100);

                                            // 3. Payments (in this period)
                                            const payments = financialReport.payments.filter(p => p.professional_id === pro.id).reduce((acc, p) => acc + parseFloat(p.amount), 0);

                                            // 4. Balance (This is tricky because it depends on LIFETIME, not just this period. 
                                            // But for now, user asked "Caixa para esses valores" implies period scope or accumulation. 
                                            // Let's show "Saldo do Período" (Comissão - Pagos). 
                                            // True Ledger requires fetching ALL history. 
                                            // Only showing Period Balance for now to match Date Filter scope).
                                            const balance = commission - payments;

                                            return (
                                                <tr key={pro.id} className="hover:bg-salon-white/5 transition-colors print:text-black">
                                                    <td className="p-4 font-medium text-white print:text-black">{pro.name}</td>
                                                    <td className="p-4 text-right text-salon-stone print:text-black">{commissionRate}%</td>
                                                    <td className="p-4 text-right font-mono text-white print:text-black">
                                                        R$ {production.toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-salon-gold font-bold print:text-black">
                                                        R$ {commission.toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-red-400 print:text-black">
                                                        R$ {payments.toFixed(2)}
                                                    </td>
                                                    <td className={`p-4 text-right font-mono font-bold ${balance >= 0 ? 'text-blue-400' : 'text-red-500'} print:text-black`}>
                                                        R$ {balance.toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-center print:hidden flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setStatementProfessional(pro);
                                                            }}
                                                            className="text-xs bg-salon-gold/20 text-salon-gold border border-salon-gold/50 px-3 py-1 rounded hover:bg-salon-gold hover:text-black transition-all"
                                                        >
                                                            Extrato
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setPaymentProfessional(pro);
                                                                setPaymentModalOpen(true);
                                                            }}
                                                            className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded"
                                                        >
                                                            Pagar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Payments List */}
                        <div className="bg-salon-black/50 border border-salon-brown/30 rounded-xl overflow-hidden print:hidden">
                            <div className="p-4 border-b border-salon-brown/30 bg-salon-white/5">
                                <h3 className="font-bold text-white">Histórico de Pagamentos (Período)</h3>
                            </div>
                            {financialReport.payments.length === 0 ? (
                                <div className="p-8 text-center text-salon-stone">Nenhum pagamento registrado neste período.</div>
                            ) : (
                                <div className="divide-y divide-salon-brown/20">
                                    {financialReport.payments.map((payment) => {
                                        const pro = professionals.find(p => p.id === payment.professional_id);
                                        return (
                                            <div key={payment.id} className="p-4 flex justify-between items-center hover:bg-white/5">
                                                <div>
                                                    <div className="font-bold text-white">{pro?.name || 'Profissional Removido'}</div>
                                                    <div className="text-xs text-salon-stone">{new Date(payment.date).toLocaleDateString('pt-BR')} • {payment.note || 'Sem nota'}</div>
                                                </div>
                                                <div className="text-red-400 font-bold">- R$ {parseFloat(payment.amount).toFixed(2)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Payment Modal */}
            {paymentModalOpen && paymentProfessional && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-salon-black border border-salon-gold/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-2">Registrar Pagamento</h3>
                        <p className="text-salon-stone mb-4">Para: <span className="text-white font-bold">{paymentProfessional.name}</span></p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-salon-stone text-sm mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full bg-salon-black border border-salon-gold/50 rounded-lg p-3 text-white text-xl font-bold focus:border-salon-gold outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-salon-stone text-sm mb-1">Observação</label>
                                <input
                                    type="text"
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                    placeholder="Ex: Adiantamento, Fechamento quinzenal..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setPaymentModalOpen(false)} className="flex-1 py-3 rounded-lg text-salon-stone hover:bg-white/5 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleRegisterPayment} className="flex-1 bg-salon-gold text-salon-black py-3 rounded-lg font-bold hover:bg-white transition-colors">
                                Confirmar Pagamento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {
                activeTab === 'style' && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6">Personalizar Estilo do Site</h2>
                        <p className="text-salon-stone mb-8">Escolha uma paleta de cores para transformar a aparência do seu site instantaneamente.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {themes.map((theme: any) => (
                                <button
                                    key={theme.id}
                                    onClick={async () => {
                                        // Optimistic update
                                        const newSettings = { ...settings, currentTheme: theme.id };
                                        setSettings(newSettings);

                                        // Save to backend
                                        const { saveSettings } = await import('@/app/actions');
                                        await saveSettings(slug, { currentTheme: theme.id });

                                        // Dispatch event for ThemeRegistry to pick up immediately
                                        window.dispatchEvent(new CustomEvent('themeChange', { detail: { themeId: theme.id } }));
                                    }}
                                    className={`relative group rounded-xl overflow-hidden border-2 transition-all text-left ${settings.currentTheme === theme.id ? 'border-salon-gold scale-105 shadow-[0_0_20px_rgba(253,218,178,0.2)]' : 'border-salon-brown/50 hover:border-gray-500'}`}
                                >
                                    <div className="h-32 w-full flex">
                                        <div style={{ backgroundColor: theme.colors.black }} className="h-full flex-1"></div>
                                        <div style={{ backgroundColor: theme.colors.brown }} className="h-full flex-1"></div>
                                        <div style={{ backgroundColor: theme.colors.gold }} className="h-full flex-1"></div>
                                        <div style={{ backgroundColor: theme.colors.beige }} className="h-full flex-1"></div>
                                    </div>
                                    <div className="p-4 bg-salon-black">
                                        <h3 className="font-bold text-white select-none">{theme.name}</h3>
                                        {settings.currentTheme === theme.id && (
                                            <div className="absolute top-2 right-2 bg-salon-gold text-salon-black text-xs font-bold px-2 py-1 rounded-full">
                                                Ativo
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'settings' && (
                    <div className="bg-salon-black/50 border border-salon-brown/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white mb-4">Configurações do Salão</h2>
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            {/* Operating Hours */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Horário de Início</label>
                                    <input
                                        type="time"
                                        value={settings.startHour}
                                        onChange={(e) => setSettings({ ...settings, startHour: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Horário de Fim</label>
                                    <input
                                        type="time"
                                        value={settings.endHour}
                                        onChange={(e) => setSettings({ ...settings, endHour: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                    />
                                </div>
                            </div>

                            {/* Address & Location */}
                            <div className="grid grid-cols-1 gap-4 border-t border-salon-brown/30 pt-4">
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Endereço Completo</label>
                                    <input
                                        type="text"
                                        value={settings.address || ''}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                        placeholder="Rua Exemplo, 123 - Centro, Cidade - UF"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Link do Google Maps</label>
                                    <input
                                        type="text"
                                        value={settings.googleMapsUrl || ''}
                                        onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                        placeholder="Cola aqui o link (ex: https://maps.app.goo.gl/...)"
                                    />
                                    <p className="text-xs text-salon-stone mt-1">Aceita link curto ou link completo do Google Maps.</p>
                                </div>
                            </div>

                            {/* Weekly Schedule */}
                            <div className="border-t border-salon-brown/30 pt-4">
                                <h3 className="text-salon-gold font-bold mb-3 text-sm uppercase tracking-wider">Horários de Funcionamento (Semanal)</h3>
                                <div className="space-y-3">
                                    {[
                                        'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
                                    ].map((dayName, index) => {
                                        const daySchedule = settings.weeklySchedule?.[index] || { active: true, start: "09:00", end: "19:00" };

                                        return (
                                            <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-salon-black/30 p-3 rounded-lg border border-salon-brown/20">
                                                <div className="w-32 flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={daySchedule.active}
                                                        onChange={(e) => {
                                                            const newSchedule = { ...settings.weeklySchedule };
                                                            newSchedule[index] = { ...daySchedule, active: e.target.checked };
                                                            setSettings({ ...settings, weeklySchedule: newSchedule });
                                                        }}
                                                        className="w-4 h-4 accent-salon-gold"
                                                    />
                                                    <span className={daySchedule.active ? 'text-white' : 'text-salon-stone'}>{dayName}</span>
                                                </div>

                                                {daySchedule.active && (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                            type="time"
                                                            value={daySchedule.start}
                                                            onChange={(e) => {
                                                                const newSchedule = { ...settings.weeklySchedule };
                                                                newSchedule[index] = { ...daySchedule, start: e.target.value };
                                                                setSettings({ ...settings, weeklySchedule: newSchedule });
                                                            }}
                                                            className="bg-salon-black border border-salon-brown rounded px-2 py-1 text-white text-sm"
                                                        />
                                                        <span className="text-salon-stone">-</span>
                                                        <input
                                                            type="time"
                                                            value={daySchedule.end}
                                                            onChange={(e) => {
                                                                const newSchedule = { ...settings.weeklySchedule };
                                                                newSchedule[index] = { ...daySchedule, end: e.target.value };
                                                                setSettings({ ...settings, weeklySchedule: newSchedule });
                                                            }}
                                                            className="bg-salon-black border border-salon-brown rounded px-2 py-1 text-white text-sm"
                                                        />
                                                    </div>
                                                )}
                                                {!daySchedule.active && (
                                                    <span className="text-red-400 text-sm font-bold flex-1">FECHADO</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Lunch Break */}
                            <div className="border-t border-salon-brown/30 pt-4">
                                <h3 className="text-salon-gold font-bold mb-3 text-sm uppercase tracking-wider">Horário de Almoço</h3>
                                <div className="flex flex-col md:flex-row items-center gap-4 bg-salon-black/30 p-3 rounded-lg border border-salon-brown/20">
                                    <div className="w-32 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={settings.lunchActive || false}
                                            onChange={(e) => setSettings({ ...settings, lunchActive: e.target.checked })}
                                            className="w-4 h-4 accent-salon-gold"
                                        />
                                        <span className={settings.lunchActive ? 'text-white' : 'text-salon-stone'}>Habilitar</span>
                                    </div>
                                    <div className={`flex items-center gap-2 flex-1 ${!settings.lunchActive ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <input
                                            type="time"
                                            value={settings.lunchStart || "12:00"}
                                            onChange={(e) => setSettings({ ...settings, lunchStart: e.target.value })}
                                            className="bg-salon-black border border-salon-brown rounded px-2 py-1 text-white text-sm"
                                        />
                                        <span className="text-salon-stone">até</span>
                                        <input
                                            type="time"
                                            value={settings.lunchEnd || "13:00"}
                                            onChange={(e) => setSettings({ ...settings, lunchEnd: e.target.value })}
                                            className="bg-salon-black border border-salon-brown rounded px-2 py-1 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Identity (Logo/Name) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-salon-brown/30 pt-4">
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Nome do Salão</label>
                                    <input
                                        type="text"
                                        value={settings.salonName || ''}
                                        onChange={(e) => setSettings({ ...settings, salonName: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                        placeholder="Ex: Julio Studio"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Slogan (Opcional)</label>
                                    <input
                                        type="text"
                                        value={settings.slogan || ''}
                                        onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                        placeholder="Ex: O melhor corte da região"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Slogan (Opcional)</label>
                                    <input
                                        type="text"
                                        value={settings.slogan || ''}
                                        onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                                        className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                        placeholder="Ex: O melhor corte da região"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Logo do Salão</label>
                                    <div className="flex gap-4 items-center">
                                        {settings.logoUrl && (
                                            <div className="w-16 h-16 bg-white rounded-lg p-1 overflow-hidden relative group">
                                                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const { uploadLogo } = await import('@/app/actions');
                                                        const result = await uploadLogo(slug, formData);
                                                        if (result.success && result.url) {
                                                            setSettings({ ...settings, logoUrl: result.url });
                                                            alert("Logo enviado com sucesso!");
                                                        } else {
                                                            alert("Erro ao enviar logo.");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erro ao enviar logo.");
                                                    }
                                                }}
                                                className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-salon-gold file:text-salon-black hover:file:bg-white"
                                            />
                                            <p className="text-[10px] text-salon-stone mt-2">Selecione uma imagem para enviar e salvar no diretório.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SaaS Site Address (Slug) */}
                            <div className="border-t border-salon-brown/30 pt-4">
                                <h3 className="text-salon-gold font-bold mb-3 text-sm uppercase tracking-wider">Endereço do Site (SaaS)</h3>
                                <div>
                                    <label className="block text-salon-stone mb-2 text-sm">Identificador da Barbearia (Slug)</label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-salon-stone text-sm">unobarber.com/</span>
                                            <input
                                                type="text"
                                                value={settings.slug || ''}
                                                onChange={async (e) => {
                                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                                    setSettings({ ...settings, slug: val });
                                                }}
                                                onBlur={async (e) => {
                                                    const newSlug = e.target.value;
                                                    if (!newSlug) return;
                                                    if (newSlug === slug) return; // Unchanged

                                                    try {
                                                        const { checkSlugAvailability, getSlugSuggestions } = await import('@/app/actions');
                                                        const check = await checkSlugAvailability(newSlug);

                                                        if (!check.available) {
                                                            alert(`O endereço "${newSlug}" já está em uso.`);
                                                            const suggestions = await getSlugSuggestions(newSlug);
                                                            if (suggestions.length > 0) {
                                                                const chosen = prompt(`Sugestões disponíveis:\n${suggestions.join('\n')}\n\nDigite uma das opções para usar:`);
                                                                if (chosen && suggestions.includes(chosen)) {
                                                                    setSettings({ ...settings, slug: chosen });
                                                                }
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }}
                                                className="flex-1 bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                                placeholder="nome-da-barbearia"
                                            />
                                        </div>
                                        <p className="text-[10px] text-salon-stone">Este será o link exclusivo para seus clientes agendarem.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="border-t border-salon-brown/30 pt-4">
                                <h3 className="text-salon-gold font-bold mb-3 text-sm uppercase tracking-wider">Redes Sociais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-salon-stone mb-2 text-sm">Instagram (URL)</label>
                                        <input
                                            type="text"
                                            value={settings.socialMedia?.instagram || ''}
                                            onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, instagram: e.target.value } })}
                                            className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-salon-stone mb-2 text-sm">Facebook (URL)</label>
                                        <input
                                            type="text"
                                            value={settings.socialMedia?.facebook || ''}
                                            onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, facebook: e.target.value } })}
                                            className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-salon-stone mb-2 text-sm">WhatsApp (Número)</label>
                                        <PhoneInput
                                            value={settings.socialMedia?.whatsapp || ''}
                                            onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, whatsapp: e.target.value } })}
                                            className="w-full bg-salon-black border border-salon-brown rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-salon-brown text-salon-gold border border-salon-gold px-6 py-3 rounded-lg hover:bg-salon-gold hover:text-black transition-colors font-bold"
                            >
                                Salvar Todas as Configurações
                            </button>
                        </form>
                    </div>
                )
            }

            {
                activeTab === 'team' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Profissionais</h2>
                            <div className="space-y-4">
                                {professionals.map(pro => (
                                    <div key={pro.id} className="p-4 rounded-lg border border-salon-brown/30 bg-salon-black/50 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-salon-gold/20 flex items-center justify-center text-salon-gold font-bold">
                                                {pro.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{pro.name}</h3>
                                                <div className="text-sm text-salon-stone">
                                                    {pro.active ? <span className="text-green-400">Ativo</span> : <span className="text-red-400">Inativo</span>}
                                                    {pro.specialty && <span className="ml-2">• {pro.specialty}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const newStatus = !pro.active;
                                                    handleSaveProfessional({ preventDefault: () => { } } as any, { ...pro, active: newStatus });
                                                }}
                                                className="p-2 text-salon-stone hover:text-white"
                                                title={pro.active ? "Desativar" : "Ativar"}
                                            >
                                                {pro.active ? '🚫' : '✅'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProfessional(pro.id)}
                                                className="p-2 text-red-400 hover:text-red-300"
                                            >
                                                🗑️
                                            </button>
                                            <button
                                                onClick={() => setEditingProfessional(pro)}
                                                className="p-2 text-blue-400 hover:text-blue-300"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-salon-black/80 border border-salon-gold/50 p-6 rounded-xl h-fit">
                            <h2 className="text-xl font-bold text-white mb-4">{editingProfessional ? 'Editar Profissional' : 'Adicionar Profissional'}</h2>
                            <form onSubmit={(e) => {
                                const formData = new FormData(e.currentTarget);
                                const newPro = {
                                    id: editingProfessional?.id, // Keep ID if editing
                                    name: formData.get('name'),
                                    specialty: formData.get('specialty'),
                                    bio: formData.get('bio'),
                                    commissionPercentage: Number(formData.get('commission')) || 100,
                                    active: editingProfessional ? editingProfessional.active : true
                                };

                                // Collect selected services
                                const selectedServices = services
                                    .filter(s => (document.getElementById(`service-${s.id}`) as HTMLInputElement)?.checked)
                                    .map(s => s.id);

                                handleSaveProfessional(e, newPro, selectedServices);
                                if (!editingProfessional) e.currentTarget.reset();
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-salon-stone text-sm mb-1">Nome</label>
                                    <input
                                        name="name"
                                        defaultValue={editingProfessional?.name || ''}
                                        className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone text-sm mb-1">Especialidade</label>
                                    <input
                                        name="specialty"
                                        defaultValue={editingProfessional?.specialty || ''}
                                        className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                        placeholder="Ex: Barba, Corte Infantil"
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone text-sm mb-1">Comissão (%)</label>
                                    <input
                                        type="number"
                                        name="commission"
                                        defaultValue={editingProfessional?.commissionPercentage || 100}
                                        min="0"
                                        max="100"
                                        className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-salon-stone text-sm mb-1">Bio (Opcional)</label>
                                    <textarea
                                        name="bio"
                                        defaultValue={editingProfessional?.bio || ''}
                                        className="w-full bg-salon-black border border-salon-brown rounded p-2 text-white"
                                        rows={3}
                                    />
                                </div>

                                {editingProfessional && (
                                    <div className="border-t border-salon-brown/30 pt-4">
                                        <label className="block text-salon-gold text-sm font-bold mb-2">Serviços Habilitados</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                            {services.map(service => {
                                                const isChecked = !service.allowedProfessionals || service.allowedProfessionals.length === 0 || service.allowedProfessionals.includes(editingProfessional.id);
                                                return (
                                                    <div key={service.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`service-${service.id}`}
                                                            defaultChecked={isChecked}
                                                            className="rounded border-salon-brown bg-salon-black text-salon-gold focus:ring-salon-gold"
                                                        />
                                                        <label htmlFor={`service-${service.id}`} className="text-sm text-salon-stone cursor-pointer select-none">
                                                            {service.title}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-salon-stone mt-1">
                                            Desmarque para impedir que este profissional receba agendamentos deste serviço.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {editingProfessional && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingProfessional(null)}
                                            className="w-1/3 bg-salon-brown text-white font-bold py-3 rounded hover:bg-salon-stone transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    <button type="submit" className="w-full bg-salon-gold text-salon-black font-bold py-3 rounded hover:bg-white transition-colors">
                                        {editingProfessional ? 'Salvar Alterações' : 'Adicionar Profissional'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'financial' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Relatórios Financeiros</h2>
                            <input
                                type="month"
                                value={financialMonth}
                                onChange={(e) => setFinancialMonth(e.target.value)}
                                className="bg-salon-black border border-salon-brown rounded-lg p-2 text-white outline-none focus:border-salon-gold"
                            />
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(() => {
                                // Calculate Stats
                                const filteredBookings = bookings.filter(b => b.date.startsWith(financialMonth));
                                const completedBookings = filteredBookings.filter(b => b.status === 'completed');

                                const totalRevenue = completedBookings.reduce((acc, b) => {
                                    // Extract price from service (simplified, assuming service object is full)
                                    const price = b.service?.price || 0;
                                    return acc + price;
                                }, 0);
                                const avgTicket = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

                                return (
                                    <>
                                        <div className="bg-salon-black border border-salon-gold/30 p-6 rounded-xl">
                                            <h3 className="text-salon-stone text-sm uppercase tracking-wider mb-2">Faturamento Total</h3>
                                            <p className="text-3xl font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</p>
                                            <p className="text-xs text-salon-stone mt-1">{completedBookings.length} atendimentos concluídos</p>
                                        </div>
                                        <div className="bg-salon-black border border-salon-gold/30 p-6 rounded-xl">
                                            <h3 className="text-salon-stone text-sm uppercase tracking-wider mb-2">Ticket Médio</h3>
                                            <p className="text-3xl font-bold text-salon-gold">R$ {avgTicket.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-salon-black border border-salon-gold/30 p-6 rounded-xl">
                                            <h3 className="text-salon-stone text-sm uppercase tracking-wider mb-2">Projeção (Agendados)</h3>
                                            <p className="text-3xl font-bold text-white">
                                                R$ {filteredBookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (b.service?.price || 0), 0).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-salon-stone mt-1">Em agendamentos futuros</p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Subscription Section */}
                        <div className="bg-salon-black/80 border border-salon-gold/30 p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                💎 Sua Assinatura
                                {subscriptionData && (
                                    <span className={`text-xs px-2 py-0.5 rounded border ${new Date(subscriptionData.license.expiration) > new Date() ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
                                        {new Date(subscriptionData.license.expiration) > new Date() ? 'ATIVA' : 'EXPIRADA'}
                                    </span>
                                )}
                            </h2>

                            {subscriptionData ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-salon-black border border-salon-brown/30 rounded-lg">
                                            <p className="text-salon-stone text-sm">Plano Atual</p>
                                            <p className="text-xl font-bold text-white">
                                                {subscriptionData.license.plan === 'pro' ? 'UnoBarber PRO' : 'Gratuito'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-salon-black border border-salon-brown/30 rounded-lg">
                                            <p className="text-salon-stone text-sm">Válido Até</p>
                                            <p className="text-xl font-bold text-salon-gold">
                                                {new Date(subscriptionData.license.expiration).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-3">Histórico de Pagamentos</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-salon-stone">
                                                <thead className="border-b border-salon-brown/30 text-salon-gold uppercase text-xs">
                                                    <tr>
                                                        <th className="py-2">Data</th>
                                                        <th className="py-2">Descrição</th>
                                                        <th className="py-2">Valor</th>
                                                        <th className="py-2">Status</th>
                                                        <th className="py-2">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-salon-brown/10">
                                                    {subscriptionData.history && subscriptionData.history.length > 0 ? (
                                                        subscriptionData.history.map((payment: any) => (
                                                            <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                                                <td className="py-3">{new Date(payment.date).toLocaleDateString('pt-BR')}</td>
                                                                <td className="py-3">{payment.description}</td>
                                                                <td className="py-3">R$ {payment.value.toFixed(2)}</td>
                                                                <td className="py-3">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold
                                                                        ${payment.status === 'RECEIVED' || payment.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                                                            payment.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400' :
                                                                                'bg-yellow-500/20 text-yellow-400'}`}>
                                                                        {payment.status}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3">
                                                                    {payment.invoiceUrl && (
                                                                        <a href={payment.invoiceUrl} target="_blank" className="text-salon-gold hover:underline">
                                                                            Ver Fatura
                                                                        </a>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="py-4 text-center italic opacity-50">Nenhum pagamento registrado.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salon-gold mx-auto mb-2"></div>
                                    <p className="text-salon-stone text-sm">Carregando informações da assinatura...</p>
                                </div>
                            )}
                        </div>

                        {/* Revenue by Professional */}
                        <div className="bg-salon-black/50 border border-salon-brown/30 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Faturamento por Profissional</h3>
                            <div className="space-y-4">
                                {(() => {
                                    const revenueByPro: Record<string, number> = {};
                                    const countByPro: Record<string, number> = {};

                                    bookings
                                        .filter(b => b.date.startsWith(financialMonth)) // Filter by Month
                                        .filter(b => b.status === 'completed')
                                        .forEach(b => {
                                            const proName = b.professionalName || 'Não Atribuído';
                                            const price = b.service?.price || 0;
                                            revenueByPro[proName] = (revenueByPro[proName] || 0) + price;
                                            countByPro[proName] = (countByPro[proName] || 0) + 1;
                                        });

                                    const sortedPros = Object.entries(revenueByPro).sort(([, a], [, b]) => b - a);
                                    const maxRevenue = Math.max(...Object.values(revenueByPro), 1); // Avoid div by zero

                                    return sortedPros.map(([name, revenue]) => (
                                        <div key={name} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white font-bold">{name}</span>
                                                <span className="text-salon-gold">R$ {revenue.toFixed(2)} ({countByPro[name]} cortes)</span>
                                            </div>
                                            <div className="w-full bg-salon-brown/20 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-salon-gold h-full rounded-full transition-all"
                                                    style={{ width: `${(revenue / maxRevenue) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                {Object.keys(bookings).length === 0 && <p className="text-salon-stone">Nenhum dado financeiro disponível.</p>}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Statement Modal */}
            {statementProfessional && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 print:relative print:bg-white print:p-0 print:block">
                    <div className="bg-salon-black border border-salon-gold/20 p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:bg-white print:max-w-none print:max-h-none print:overflow-visible">
                        <div className="flex justify-between items-center mb-6 print:hidden">
                            <h2 className="text-xl font-bold text-white">Extrato Detalhado</h2>
                            <button onClick={() => setStatementProfessional(null)} className="text-salon-stone hover:text-white">✕</button>
                        </div>

                        <div className="print:block">
                            <div className="text-center mb-8 border-b border-gray-200 pb-4">
                                <h1 className="text-2xl font-bold text-white print:text-black mb-1">{statementProfessional.name}</h1>
                                <p className="text-salon-stone print:text-gray-600 text-sm">
                                    Extrato de Período: {new Date(financialStartDate).toLocaleDateString()} até {new Date(financialEndDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                                {/* CREDITS SECTION */}
                                <div>
                                    <h3 className="text-lg font-bold text-green-400 print:text-black border-b border-green-400/30 pb-2 mb-4">
                                        Créditos (Comissões)
                                    </h3>
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-salon-stone uppercase border-b border-white/10 print:text-gray-500 print:border-gray-300">
                                            <tr>
                                                <th className="py-2">Data</th>
                                                <th className="py-2">Serviço/Cliente</th>
                                                <th className="py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10 print:divide-gray-200">
                                            {financialReport.bookings
                                                .filter(b => b.professional_id === statementProfessional.id || b.professional_name === statementProfessional.name)
                                                .map(b => {
                                                    const commissionRate = statementProfessional.commissionPercentage || 100;
                                                    const commission = (b.service_price || 0) * (commissionRate / 100);
                                                    return (
                                                        <tr key={b.id}>
                                                            <td className="py-2 text-salon-stone print:text-gray-700">{new Date(b.date).toLocaleDateString()}</td>
                                                            <td className="py-2 text-white print:text-black">
                                                                <div>{b.service?.name}</div>
                                                                <div className="text-xs text-salon-stone">{b.customerName}</div>
                                                            </td>
                                                            <td className="py-2 text-right text-green-400 print:text-black">R$ {commission.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            {financialReport.bookings.filter(b => b.professional_id === statementProfessional.id || b.professional_name === statementProfessional.name).length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-4 text-center text-salon-stone">Nenhum serviço neste período.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="border-t border-white/20 print:border-gray-300 font-bold">
                                            <tr>
                                                <td colSpan={2} className="py-3 text-white print:text-black">Total Créditos</td>
                                                <td className="py-3 text-right text-green-400 print:text-black">
                                                    R$ {financialReport.bookings
                                                        .filter(b => b.professional_id === statementProfessional.id || b.professional_name === statementProfessional.name)
                                                        .reduce((acc, b) => acc + ((b.service_price || 0) * ((statementProfessional.commissionPercentage || 100) / 100)), 0)
                                                        .toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* DEBITS SECTION */}
                                <div>
                                    <h3 className="text-lg font-bold text-red-400 print:text-black border-b border-red-400/30 pb-2 mb-4">
                                        Débitos (Pagamentos/Adiantamentos)
                                    </h3>
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-salon-stone uppercase border-b border-white/10 print:text-gray-500 print:border-gray-300">
                                            <tr>
                                                <th className="py-2">Data</th>
                                                <th className="py-2">Descrição</th>
                                                <th className="py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10 print:divide-gray-200">
                                            {financialReport.payments
                                                .filter(p => p.professional_id === statementProfessional.id)
                                                .map(p => (
                                                    <tr key={p.id}>
                                                        <td className="py-2 text-salon-stone print:text-gray-700">{new Date(p.date).toLocaleDateString()}</td>
                                                        <td className="py-2 text-white print:text-black">{p.note || 'Pagamento'}</td>
                                                        <td className="py-2 text-right text-red-400 print:text-black">R$ {parseFloat(p.amount).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            {financialReport.payments.filter(p => p.professional_id === statementProfessional.id).length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-4 text-center text-salon-stone">Nenhum pagamento desete período.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="border-t border-white/20 print:border-gray-300 font-bold">
                                            <tr>
                                                <td colSpan={2} className="py-3 text-white print:text-black">Total Débitos</td>
                                                <td className="py-3 text-right text-red-400 print:text-black">
                                                    R$ {financialReport.payments
                                                        .filter(p => p.professional_id === statementProfessional.id)
                                                        .reduce((acc, p) => acc + parseFloat(p.amount), 0)
                                                        .toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-salon-gold/30 print:border-black flex justify-between items-center bg-salon-white/5 p-4 rounded-xl print:bg-gray-100">
                                <div className="text-lg text-white print:text-black">Saldo Final do Período</div>
                                <div className={`text-3xl font-bold print:text-black ${(financialReport.bookings
                                        .filter(b => b.professional_id === statementProfessional.id || b.professional_name === statementProfessional.name)
                                        .reduce((acc, b) => acc + ((b.service_price || 0) * ((statementProfessional.commissionPercentage || 100) / 100)), 0) -
                                        financialReport.payments
                                            .filter(p => p.professional_id === statementProfessional.id)
                                            .reduce((acc, p) => acc + parseFloat(p.amount), 0)) >= 0 ? 'text-blue-400' : 'text-red-500'
                                    }`}>
                                    R$ {(financialReport.bookings
                                        .filter(b => b.professional_id === statementProfessional.id || b.professional_name === statementProfessional.name)
                                        .reduce((acc, b) => acc + ((b.service_price || 0) * ((statementProfessional.commissionPercentage || 100) / 100)), 0) -
                                        financialReport.payments
                                            .filter(p => p.professional_id === statementProfessional.id)
                                            .reduce((acc, p) => acc + parseFloat(p.amount), 0)).toFixed(2)}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-4 print:hidden">
                                <button
                                    onClick={() => setStatementProfessional(null)}
                                    className="px-4 py-2 rounded text-salon-stone hover:bg-white/10 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="bg-salon-gold text-salon-black px-6 py-2 rounded font-bold hover:bg-white transition-colors"
                                >
                                    🖨️ Imprimir Extrato
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
