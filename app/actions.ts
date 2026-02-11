'use server';

import { supabase } from './lib/supabase';
import { revalidatePath } from 'next/cache';

// --- Service Management ---

export async function getServices(slug: string) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_slug', slug)
        .eq('active', true);

    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }
    return data || [];
}

interface Service {
    id?: string;
    title: string;
    price: number;
    duration: string;
    type: 'service' | 'combo';
    active?: boolean;
    discountPrice?: number;
    allowedProfessionals?: string[];
}

export async function saveService(slug: string, service: Service) {
    if (service.active === undefined) service.active = true;

    const serviceData = {
        tenant_slug: slug,
        title: service.title,
        price: service.price,
        duration: service.duration,
        type: service.type,
        active: service.active,
        discount_price: service.discountPrice,
        allowed_professionals: service.allowedProfessionals
    };

    let error;
    if (service.id) {
        const { error: updateError } = await supabase
            .from('services')
            .update(serviceData)
            .eq('id', service.id)
            .eq('tenant_slug', slug);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('services')
            .insert([serviceData]);
        error = insertError;
    }

    if (error) {
        console.error('Error saving service:', error);
        return { success: false, message: 'Failed to save service' };
    }
    return { success: true, message: 'Service saved successfully' };
}

export async function deleteService(slug: string, serviceId: string) {
    const { error } = await supabase
        .from('services')
        .update({ active: false })
        .eq('id', serviceId)
        .eq('tenant_slug', slug);

    if (error) {
        console.error('Error deleting service:', error);
        return { success: false, message: 'Failed to delete service' };
    }
    return { success: true };
}

// --- Settings Management ---
const DEFAULT_SETTINGS = {
    startHour: "09:00",
    endHour: "19:00",
    daysOpen: [1, 2, 3, 4, 5, 6], // Mon-Sat
    timeInterval: 30, // minutes
    logoUrl: "",
    primaryColor: "#D4AF37", // Gold
    whatsapp: "",
    salonName: "Sua Barbearia",
    slogan: "",
    address: "",
    googleMapsUrl: "",
    instagram: ""
};

export async function getSettings(slug: string) {
    const { data, error } = await supabase
        .from('tenants')
        .select('settings')
        .eq('slug', slug)
        .single();

    if (error || !data) {
        return DEFAULT_SETTINGS;
    }
    // Merge defaults
    return { ...DEFAULT_SETTINGS, ...data.settings };
}

export async function saveSettings(slug: string, settings: any) {
    const { data: existing } = await supabase.from('tenants').select('slug').eq('slug', slug).single();

    if (!existing) {
        await supabase.from('tenants').insert([{ slug, settings }]);
    } else {
        await supabase.from('tenants').update({ settings }).eq('slug', slug);
    }
    return { success: true };
}

export async function uploadLogo(slug: string, formData: FormData) {
    // Stub for now as we don't have Storage buckets configured
    console.log("Upload requested but Storage not configured");
    return { success: false, message: "Upload de imagem requer configuração de Storage (Buckets) no Supabase.", url: "" };
}

export async function checkSlugAvailability(slug: string) {
    const { data } = await supabase.from('tenants').select('slug').eq('slug', slug).single();
    return { available: !data };
}

export async function getSlugSuggestions(slug: string) {
    return [`${slug}barber`, `${slug}oficial`, `${slug}salao`];
}

// --- Booking Management ---

export async function getBookings(slug: string) {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_slug', slug)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }

    return data.map(b => ({
        id: b.id,
        date: b.date,
        time: b.time,
        client: { name: b.client_name, phone: b.client_phone },
        service: { title: b.service_title, price: b.service_price },
        professionalName: b.professional_name,
        status: b.status,
        createdAt: b.created_at,
        // Mock followUp 
        followUp: { sent: false, days: 30, scheduledDate: '2025-01-01' }
    }));
}

export async function saveBooking(slug: string, bookingData: any) {
    const newBooking = {
        tenant_slug: slug,
        date: bookingData.date,
        time: bookingData.time,
        client_name: bookingData.clientName || bookingData.client?.name,
        client_phone: bookingData.clientPhone || bookingData.client?.phone,
        service_title: bookingData.serviceName || bookingData.service?.title,
        service_price: bookingData.servicePrice || bookingData.service?.price,
        professional_name: bookingData.professionalName,
        status: 'confirmed'
    };

    const { error } = await supabase.from('bookings').insert([newBooking]);

    if (error) {
        console.error('Error saving booking:', error);
        return { success: false, message: 'Erro ao salvar agendamento.' };
    }

    revalidatePath(`/${slug}/admin`);
    return { success: true, message: 'Agendamento realizado com sucesso!' };
}

// ALIAS for frontend compatibility
export async function submitBooking(slug: string, bookingData: any) {
    return saveBooking(slug, bookingData);
}

export async function cancelBooking(slug: string, bookingId: string) {
    const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('tenant_slug', slug);

    if (error) throw new Error("Failed to cancel");
    revalidatePath(`/${slug}/admin`);
    return { success: true };
}

export async function completeBooking(slug: string, bookingId: string, days?: number) {
    const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId)
        .eq('tenant_slug', slug);

    if (error) throw new Error("Failed to complete");
    revalidatePath(`/${slug}/admin`);
    return { success: true };
}

// --- Professional Management ---

export async function getProfessionals(slug: string) {
    const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('tenant_slug', slug)
        .eq('active', true);

    if (error) return [];
    return data;
}

export async function saveProfessional(slug: string, professional: any) {
    const proData = {
        tenant_slug: slug,
        name: professional.name,
        specialty: professional.specialty,
        bio: professional.bio,
        photo_url: professional.photoUrl,
        active: professional.active !== false
    };

    let error;
    if (professional.id) {
        const { error: updateError } = await supabase
            .from('professionals')
            .update(proData)
            .eq('id', professional.id)
            .eq('tenant_slug', slug);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('professionals')
            .insert([proData]);
        error = insertError;
    }

    if (error) return { success: false, message: "Erro ao salvar profissional." };
    return { success: true, message: "Profissional salvo!" };
}

export async function deleteProfessional(slug: string, id: string) {
    const { error } = await supabase
        .from('professionals')
        .update({ active: false })
        .eq('id', id)
        .eq('tenant_slug', slug);

    if (error) return { success: false, message: "Erro ao deletar." };
    return { success: true };
}

export async function updateProfessionalServices(slug: string, professionalId: string, serviceIds: string[]) {
    const { data: services } = await supabase.from('services').select('*').eq('tenant_slug', slug);
    if (!services) return;

    for (const service of services) {
        let allowed = service.allowed_professionals || [];
        const shouldBeAllowed = serviceIds.includes(service.id);
        const isCurrentlyAllowed = allowed.includes(professionalId);

        if (shouldBeAllowed && !isCurrentlyAllowed) {
            allowed.push(professionalId);
            await supabase.from('services').update({ allowed_professionals: allowed }).eq('id', service.id);
        } else if (!shouldBeAllowed && isCurrentlyAllowed) {
            allowed = allowed.filter((id: string) => id !== professionalId);
            await supabase.from('services').update({ allowed_professionals: allowed }).eq('id', service.id);
        }
    }
}

// --- Availability ---

export async function getDaysAvailability(slug: string, startDate: string, days?: number, duration?: string, professionalId?: string) {
    let startStr = startDate;
    let endStr = startDate;

    // Simple logic: just fetch bookings for the month of startDate to be safe
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (days || 35)); // Default 35 days

    startStr = start.toISOString().split('T')[0];
    endStr = end.toISOString().split('T')[0];

    let query = supabase
        .from('bookings')
        .select('date')
        .eq('tenant_slug', slug)
        .gte('date', startStr)
        .lte('date', endStr)
        .eq('status', 'confirmed');

    const { data: bookings } = await query;

    if (!bookings) return {};

    const counts: Record<string, number> = {};
    bookings.forEach(b => {
        counts[b.date] = (counts[b.date] || 0) + 1;
    });

    // Return MAP directly: { "2025-02-11": 50, "2025-02-12": 100 }
    const results: Record<string, number> = {};
    const loopEnd = new Date(end);
    for (let d = new Date(start); d <= loopEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = counts[dateStr] || 0;
        results[dateStr] = Math.min(Math.round((count / 20) * 100), 100);
    }

    return results;
}

export async function getAvailableSlots(slug: string, date: string, duration?: string, professionalId?: string) {
    const settings = await getSettings(slug);
    const bookings = await getBookings(slug);

    const dayBookings = bookings.filter((b: any) => b.date === date && b.status !== 'cancelled' && b.status !== 'no_show');

    const start = parseInt(settings.startHour.split(':')[0]);
    const end = parseInt(settings.endHour.split(':')[0]);
    const interval = settings.timeInterval || 30;

    const slots = [];
    for (let h = start; h < end; h++) {
        for (let m = 0; m < 60; m += interval) {
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const isTaken = dayBookings.some((b: any) => b.time === timeStr);
            if (!isTaken) slots.push(timeStr);
        }
    }
    return slots;
}

export async function getClientBookings(slug: string, phone: string) {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_slug', slug)
        .eq('client_phone', phone)
        .order('date', { ascending: false });

    if (error) return [];

    return data.map(b => ({
        id: b.id,
        date: b.date,
        time: b.time,
        client: { name: b.client_name, phone: b.client_phone },
        service: { title: b.service_title, price: b.service_price },
        professionalName: b.professional_name,
        status: b.status,
        createdAt: b.created_at
    }));
}

// --- Subscription ---
export async function getSystemSubscription(slug: string) {
    return {
        license: { plan: 'pro', expiration: '2026-12-31' },
        history: []
    };
}

export async function startSubscription(slug: string, plan?: string) {
    // Stub
    return { success: true, url: 'https://asaas.com/pagamento-fake', message: 'Link gerado!' };
}

export async function renewLicense(slug: string, months: number = 1) {
    // Logic to extend license would go here
    return { success: true, expirationDate: '2026-12-31' };
}

// Required for layout.tsx authentication/license check
export async function validateLicense(slug: string) {
    return { valid: true, plan: 'pro', reason: 'active' };
}
