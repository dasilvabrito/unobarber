"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PhoneInput from './PhoneInput';

const steps = ['Serviço', 'Profissional', 'Data', 'Horário', 'Confirmação'];



export default function BookingForm({ slug }: { slug: string }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [formData, setFormData] = useState({ name: "", phone: "" });
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [confirmedData, setConfirmedData] = useState<any>(null);

    const [selectedProfessional, setSelectedProfessional] = useState<string>('any');
    const [professionals, setProfessionals] = useState<any[]>([]);

    const [services, setServices] = useState<any[]>([]);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({});

    // Initial fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { getServices, getProfessionals } = await import('@/app/actions');
                const [servicesData, professionalsData] = await Promise.all([
                    getServices(slug),
                    getProfessionals(slug)
                ]);
                setServices(servicesData.filter((s: any) => s.active !== false));
                setProfessionals(professionalsData.filter((p: any) => p.active !== false));
            } catch (error) {
                console.error("Failed to fetch data");
            }
        };
        if (slug) fetchData();
    }, [slug]);

    // Fetch slots when date, service or professional changes
    useEffect(() => {
        if (selectedDate && selectedService) {
            fetchSlots();
        }
    }, [selectedDate, selectedService, selectedProfessional]);

    useEffect(() => {
        if (currentStep === 2 && selectedService) {
            const fetchAvailability = async () => {
                const { getDaysAvailability } = await import('@/app/actions');
                const today = new Date();
                const serviceObj = services.find(s => s.id === selectedService);
                const duration = serviceObj?.duration || '30 min';

                const data = await getDaysAvailability(slug, today.toISOString().split('T')[0], 35, duration, selectedProfessional || 'any');
                setAvailabilityMap(data);
            };
            fetchAvailability();
        }
    }, [currentStep, selectedService, selectedProfessional, slug, services]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        setSelectedTime(""); // Reset time when creating new fetch
        try {
            const service = services.find(s => s.id === selectedService);
            if (service) {
                const { getAvailableSlots } = await import('@/app/actions');
                const slots = await getAvailableSlots(slug, selectedDate, service.duration, selectedProfessional);
                setAvailableSlots(slots);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const getAvailablePros = () => {
        const service = services.find(s => s.id === selectedService);
        if (!service) return [];
        // If service has no specific pros (or array empty), ALL pros are filtered
        if (!service.allowedProfessionals || service.allowedProfessionals.length === 0) return professionals;
        return professionals.filter(p => service.allowedProfessionals.includes(p.id));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            let nextStep = currentStep + 1;

            // SKIP PROFESSIONAL STEP IF ONLY 1 PRO AVAILABLE
            if (currentStep === 0) {
                const availablePros = getAvailablePros();
                if (availablePros.length === 1) {
                    setSelectedProfessional(availablePros[0].id);
                    nextStep = 2; // Jump to Date
                }
            }

            setCurrentStep(nextStep);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            let prevStep = currentStep - 1;

            // IF BACK FROM DATE (Step 2) AND ONLY 1 PRO, SKIP BACK TO SERVICE (Step 0)
            if (currentStep === 2) {
                const availablePros = getAvailablePros();
                if (availablePros.length === 1) {
                    prevStep = 0;
                }
            }
            setCurrentStep(prevStep);
        }
    };

    const handleSubmit = async () => {
        const service = services.find(s => s.id === selectedService);
        const bookingData = {
            service: service,
            date: selectedDate,
            time: selectedTime,
            professionalId: selectedProfessional,
            professionalName: selectedProfessional === 'any' ? 'Qualquer Profissional' : professionals.find(p => p.id === selectedProfessional)?.name,
            client: formData
        };

        try {
            const { submitBooking } = await import('@/app/actions');
            const result = await submitBooking(slug, bookingData);
            if (result.success) {
                setConfirmedData(bookingData);
                setBookingSuccess(true);
            } else {
                alert(result.message); // Show availability error
                fetchSlots(); // Refresh slots
            }
        } catch (error) {
            alert("Erro ao agendar. Tente novamente.");
        }
    };

    const addToCalendar = () => {
        if (!confirmedData) return;

        const { date, time, service } = confirmedData;
        const [year, month, day] = date.split('-');
        const [hour, minute] = time.split(':');

        const startDate = new Date(year, month - 1, day, hour, minute);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assumes 1 hour duration approx

        const formatICSDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        };

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Agendamento Julio Studio - ${service.title}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
DESCRIPTION:Serviço: ${service.title}\\nCliente: ${formData.name}
LOCATION:Julio Studio
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'agendamento-julio-studio.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isStepValid = () => {
        if (currentStep === 0) return selectedService !== null;
        if (currentStep === 1) return true; // Professional is always valid (default 'any')
        if (currentStep === 2) return selectedDate !== "";
        if (currentStep === 3) return selectedTime !== "";
        if (currentStep === 4) {
            const cleanPhone = formData.phone.replace(/\D/g, "");
            const isMobile = cleanPhone.length === 11 && cleanPhone[2] === '9';
            return formData.name !== "" && isMobile;
        }
        return true;
    };

    // Generate next 7 days
    const getNextDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const nextDays = getNextDays();

    if (bookingSuccess) {
        return (
            <div className="max-w-4xl mx-auto p-8 bg-salon-black/50 backdrop-blur-md rounded-2xl border border-salon-gold/30 shadow-2xl">
                <div className="text-center pt-8">
                    <div className="w-16 h-16 bg-salon-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(253,218,178,0.3)] animate-bounce">
                        <svg className="w-8 h-8 text-salon-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-salon-gold mb-4">Agendamento Confirmado!</h2>
                    <p className="text-salon-stone mb-8 text-lg">
                        Seu horário foi reservado com sucesso.
                    </p>

                    <div className="bg-salon-black/50 p-6 rounded-xl border border-salon-gold/20 max-w-md mx-auto mb-8 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-salon-stone">Serviço:</span>
                            <span className="text-white font-bold">{confirmedData?.service?.title}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-salon-stone">Data:</span>
                            <span className="text-white font-bold">{confirmedData?.date.split('-').reverse().join('/')}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-salon-stone">Horário:</span>
                            <span className="text-salon-gold font-bold text-xl">{confirmedData?.time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-salon-stone">Cliente:</span>
                            <span className="text-white">{confirmedData?.client.name}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={addToCalendar}
                            className="px-6 py-3 border border-salon-gold text-salon-gold rounded-lg hover:bg-salon-gold/10 transition-colors font-bold flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Adicionar ao Google Agenda
                        </button>
                        <Link
                            href={`/${slug}`}
                            className="px-6 py-3 bg-salon-gold text-salon-black rounded-lg hover:bg-white transition-colors font-bold"
                        >
                            Voltar ao Início
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-salon-black/50 backdrop-blur-md rounded-2xl border border-salon-brown/30 shadow-2xl">
            {/* Progress Bar */}
            <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide justify-center">
                {(() => {
                    const singlePro = professionals.length === 1;
                    const visibleSteps = singlePro ? steps.filter(s => s !== 'Profissional') : steps;

                    const getVisualStepIndex = (logicalStep: number) => {
                        if (!singlePro) return logicalStep;
                        if (logicalStep === 0) return 0; // Service
                        if (logicalStep === 1) return 0; // Pro (hidden, map to Service)
                        return logicalStep - 1; // 2(Date)->1, 3(Time)->2, 4(Confirm)->3
                    };

                    const currentVisualStep = getVisualStepIndex(currentStep);

                    return visibleSteps.map((step, index) => (
                        <div key={index} className={`flex items-center flex-shrink-0 ${index <= currentVisualStep ? 'text-salon-gold' : 'text-salon-stone/50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 text-sm font-bold ${index <= currentVisualStep ? 'border-salon-gold bg-salon-gold/10' : 'border-salon-stone/50'}`}>
                                {index + 1}
                            </div>
                            <span className="font-semibold text-sm hidden md:inline">{step}</span>
                            {index < visibleSteps.length - 1 && (
                                <div className={`h-0.5 w-4 md:w-12 mx-1 md:mx-2 ${index < currentVisualStep ? 'bg-salon-gold' : 'bg-salon-stone/20'}`}></div>
                            )}
                        </div>
                    ));
                })()}
            </div>

            <div className="mb-8 min-h-[400px]">
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                onClick={() => setSelectedService(service.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.98] md:hover:scale-[1.02] ${selectedService === service.id ? 'border-salon-gold bg-salon-gold/20' : 'border-salon-brown/50 hover:border-salon-gold/50'}`}
                            >
                                <div className="flex justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-white">{service.title}</h3>
                                        {service.type === 'combo' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">COMBO</span>}
                                        {service.discountPrice && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">PROMO</span>}
                                    </div>
                                    <div className="text-right">
                                        {service.discountPrice ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-salon-stone line-through">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                                                </span>
                                                <span className="text-green-400 font-bold">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.discountPrice)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-salon-gold font-bold">
                                                {typeof service.price === 'number'
                                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)
                                                    : service.price}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-salon-stone text-sm">{service.duration}</p>
                            </div>
                        ))}
                    </div>
                )}

                {currentStep === 1 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Escolha um Profissional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setSelectedProfessional('any')}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 active:bg-salon-brown/20 ${selectedProfessional === 'any' ? 'bg-salon-gold/20 border-salon-gold' : 'border-salon-brown/50 hover:border-salon-gold/50'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-salon-gold/20 flex items-center justify-center text-salon-gold font-bold text-xl">
                                    ?
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Qualquer Profissional</h3>
                                    <p className="text-sm text-salon-stone">Máxima disponibilidade de horários</p>
                                </div>
                            </div>
                            {professionals.filter(pro => {
                                // Logic: If service has allowedProfessionals, filter. Else show all.
                                const service = services.find(s => s.id === selectedService);
                                if (!service || !service.allowedProfessionals || service.allowedProfessionals.length === 0) return true;
                                return service.allowedProfessionals.includes(pro.id);
                            }).map((pro) => (
                                <div
                                    key={pro.id}
                                    onClick={() => setSelectedProfessional(pro.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 active:bg-salon-brown/20 ${selectedProfessional === pro.id ? 'bg-salon-gold/20 border-salon-gold' : 'border-salon-brown/50 hover:border-salon-gold/50'}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-salon-stone/20 flex items-center justify-center text-salon-gold font-bold text-xl">
                                        {pro.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{pro.name}</h3>
                                        <p className="text-sm text-salon-stone">{pro.specialty || 'Profissional'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Selecione uma data</h3>
                        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                            {nextDays.map((date, i) => {
                                const dateStr = date.toISOString().split('T')[0];
                                const isSelected = selectedDate === dateStr;
                                const occupancy = availabilityMap[dateStr] ?? 0;
                                const isClosed = occupancy === -1;

                                let occupancyColor = 'bg-green-500';
                                if (occupancy > 50) occupancyColor = 'bg-yellow-500';
                                if (occupancy > 80) occupancyColor = 'bg-red-500';

                                return (
                                    <button
                                        key={i}
                                        disabled={isClosed}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`p-2 py-4 md:p-3 rounded-lg border text-center transition-all relative overflow-hidden min-h-[80px] flex flex-col justify-center items-center ${isSelected ? 'bg-salon-gold text-salon-black border-salon-gold shadow-[0_0_15px_rgba(253,218,178,0.4)]' : 'border-salon-brown hover:border-salon-gold text-salon-stone'} ${isClosed ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
                                    >
                                        {!isSelected && !isClosed && occupancy > 0 && (
                                            <div
                                                className={`absolute bottom-0 left-0 w-full opacity-20 ${occupancyColor} transition-all duration-500`}
                                                style={{ height: `${occupancy}%` }}
                                            ></div>
                                        )}

                                        <div className="relative z-10">
                                            <div className="text-xs uppercase font-bold mb-1">{date.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                                            <div className="text-lg font-bold">{date.getDate()}</div>
                                            <div className="text-xs">{date.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Horários Disponíveis</h3>
                        {loadingSlots ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-salon-gold"></div>
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="text-salon-stone text-center py-10">
                                Nenhum horário disponível para esta data/serviço.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {availableSlots.map((time, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-3 px-2 rounded-lg border transition-all font-semibold ${selectedTime === time ? 'bg-salon-gold text-salon-black border-salon-gold shadow-lg' : 'border-salon-brown hover:border-salon-gold text-salon-stone active:bg-salon-brown/20'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Seus Dados</h3>
                        <div className="space-y-4 max-w-md mx-auto">
                            <div>
                                <label className="block text-salon-stone mb-2 text-sm font-semibold">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full bg-salon-black/50 border border-salon-brown rounded-lg p-4 text-white focus:border-salon-gold outline-none text-lg transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div>
                                <label className="block text-salon-stone mb-2 text-sm font-semibold">Telefone / WhatsApp</label>
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-salon-black/50 border border-salon-brown rounded-lg p-4 text-white focus:border-salon-gold outline-none text-lg transition-colors"
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-salon-brown/20 rounded-lg border border-salon-gold/20">
                            <h4 className="text-salon-gold font-bold mb-2">Resumo do Agendamento</h4>
                            <p className="text-salon-stone">Serviço: <span className="text-white">{services.find(s => s.id === selectedService)?.title}</span></p>
                            <p className="text-salon-stone">Data: <span className="text-white">{selectedDate && new Date(selectedDate).toLocaleDateString('pt-BR')}</span></p>
                            <p className="text-salon-stone">Horário: <span className="text-salon-gold font-bold text-lg">{selectedTime || '(Selecione um horário)'}</span></p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-6 border-t border-salon-brown/30 mt-auto">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-4 md:px-6 py-3 rounded-lg font-bold transition-colors ${currentStep === 0 ? 'opacity-0 cursor-default hidden' : 'text-salon-gold border border-salon-gold hover:bg-salon-gold/10'}`}
                >
                    Voltar
                </button>

                {currentStep < steps.length - 1 ? (
                    <button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className={`flex-1 ml-4 md:flex-none px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${!isStepValid() ? 'bg-salon-stone/20 text-salon-stone cursor-not-allowed' : 'bg-salon-gold text-salon-black hover:bg-white active:scale-95'}`}
                    >
                        Próximo
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!isStepValid()}
                        className={`flex-1 ml-4 md:flex-none px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${!isStepValid() ? 'bg-salon-stone/20 text-salon-stone cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20 active:scale-95'}`}
                    >
                        Confirmar
                    </button>
                )}
            </div>
        </div>
    );
}
