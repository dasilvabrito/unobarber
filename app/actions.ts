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
    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }
    return (data || []).map((s: any) => ({
        ...s,
        discountPrice: s.discount_price,
        allowedProfessionals: s.allowed_professionals
    }));
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
        return { success: false, message: `Failed to save service: ${error.message}` };
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
    instagram: "",
    socialMedia: {
        instagram: "",
        facebook: "",
        whatsapp: ""
    }
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
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, message: "Nenhum arquivo enviado.", url: "" };
    }

    // Safety check for file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        return { success: false, message: "Arquivo muito grande. Máximo 5MB.", url: "" };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Sanitize filename
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const fileName = `${slug}-${Date.now()}-${cleanName}`;

        console.log(`Attempting to upload ${fileName} to 'logos' bucket...`);

        // Upload to Supabase Storage 'logos' bucket
        const { data, error } = await supabase.storage
            .from('logos')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error("Supabase Storage Error Details:", error);
            // Translate common errors
            if (error.message.includes("Bucket not found")) {
                return { success: false, message: "Erro: Bucket 'logos' não encontrado no Supabase." };
            }
            if (error.message.includes("new row violates row-level security policy")) {
                return { success: false, message: "Erro: Permissão negada (RLS). Verifique as políticas do Storage." };
            }
            return { success: false, message: `Erro no Storage: ${error.message}` };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(fileName);

        console.log("Upload successful:", publicUrl);
        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error("Unexpected Error uploading logo:", error);
        return { success: false, message: `Erro inesperado: ${error.message || error}` };
    }
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
    // 0. Auto-complete past bookings
    await autoCompletePastBookings(slug);

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
        professionalId: b.professional_id, // Ensure this is returned
        status: b.status,
        createdAt: b.created_at,
        // Mock followUp 
        followUp: b.follow_up_date ? {
            sent: b.follow_up_sent || false,
            days: Math.round((new Date(b.follow_up_date).getTime() - new Date(b.date).getTime()) / (1000 * 60 * 60 * 24)),
            scheduledDate: b.follow_up_date
        } : null
    }));
}

async function autoCompletePastBookings(slug: string) {
    const today = new Date().toISOString().split('T')[0];

    // Find confirmed bookings from yesterday or before
    const { data: pastBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('tenant_slug', slug)
        .eq('status', 'confirmed')
        .lt('date', today);

    if (pastBookings && pastBookings.length > 0) {
        const ids = pastBookings.map(b => b.id);
        await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .in('id', ids);
    }
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
        professional_id: bookingData.professionalId === 'any' ? null : bookingData.professionalId,
        status: 'confirmed'
    };

    // CHECK PLAN LIMITS - REMOVED: Clients can ALWAYS schedule.
    // The block happens on the ADMIN side (layout.tsx) via validateLicense.


    const { error } = await supabase.from('bookings').insert([newBooking]);

    if (error) {
        console.error('Error saving booking:', error);
        return { success: false, message: `Erro ao salvar agendamento: ${error.message}` };
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

export async function completeBooking(slug: string, bookingId: string, days?: number, finalPrice?: number, productsPrice?: number) {
    const updateData: any = { status: 'completed' };

    // If a final price is provided, update the service snapshot price
    if (finalPrice !== undefined) {
        updateData.service_price = finalPrice;
    }

    if (productsPrice !== undefined) {
        updateData.products_price = productsPrice;
    }

    // If days are provided, calculate and scheduled follow up
    if (days !== undefined) {
        if (days > 0) {
            const today = new Date();
            const followUpDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
            updateData.follow_up_date = followUpDate.toISOString().split('T')[0];
            updateData.follow_up_sent = false;
        } else {
            // If days is 0 (or negative), we assume "No Reminder", so we clear any existing follow-up
            updateData.follow_up_date = null;
            updateData.follow_up_sent = false;
        }
    }

    const { error } = await supabase
        .from('bookings')
        .update(updateData)
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
    return data.map((p: any) => ({
        ...p,
        commissionPercentage: p.commission_percentage !== null ? p.commission_percentage : 100
    }));
}

export async function saveProfessional(slug: string, professional: any) {
    const proData = {
        tenant_slug: slug,
        name: professional.name,
        specialty: professional.specialty,
        bio: professional.bio,
        photo_url: professional.photoUrl,
        active: professional.active !== false,
        commission_percentage: professional.commissionPercentage
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

    if (error) return { success: false, message: `Erro ao salvar profissional: ${error.message}` };
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

export async function dismissFollowUp(slug: string, bookingId: string) {
    const { error } = await supabase
        .from('bookings')
        .update({ follow_up_sent: true })
        .eq('id', bookingId)
        .eq('tenant_slug', slug);

    if (error) {
        console.error("Failed to dismiss follow up", error);
        return { success: false };
    }
    revalidatePath(`/${slug}/admin`);
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

    // Current Time Logic for Dynamic Blocking
    const now = new Date();
    // Adjust to Brazil time (UTC-3) roughly or rely on server time if deployed in region. 
    // Ideally use a library but for now simple check:
    // If date === now.toISOString().split('T')[0]
    const todayStr = now.toISOString().split('T')[0];
    let cutoffMinutes = -1;

    if (date === todayStr) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        cutoffMinutes = currentMinutes + 30; // 30 minute buffer
    }

    const slots = [];
    for (let h = start; h < end; h++) {
        for (let m = 0; m < 60; m += interval) {
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            // Check blocking
            const slotMinutes = h * 60 + m;
            if (cutoffMinutes > -1 && slotMinutes < cutoffMinutes) {
                continue; // Block past/soon slots
            }

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
export async function registerProfessionalPayment(slug: string, professionalId: string, amount: number, note: string) {
    const { error } = await supabase
        .from('professional_payments')
        .insert([{
            tenant_slug: slug,
            professional_id: professionalId,
            amount: amount,
            note: note,
            date: new Date().toISOString()
        }]);

    if (error) return { success: false, message: error.message };
    revalidatePath(`/${slug}/admin`);
    return { success: true };
}

export async function getFinancialReport(slug: string, startDate: string, endDate: string) {
    // 1. Fetch bookings with professional details using relation
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            *,
            professional:professional_id (
                id,
                name,
                commission_percentage
            )
        `)
        .eq('tenant_slug', slug)
        .in('status', ['completed']) // Only completed bookings count for report
        .gte('date', startDate)
        .lte('date', endDate);

    // 2. Fetch payments
    const { data: payments } = await supabase
        .from('professional_payments')
        .select('*')
        .eq('tenant_slug', slug)
        .gte('date', `${startDate}T00:00:00`)
        .lte('date', `${endDate}T23:59:59`);

    return { bookings: bookings || [], payments: payments || [] };
}

// REVISING strategy during tool call:
// I will add professional_id to bookings in schema step afterwards or I should have done it.
// I'll do it in next step. For now I place the code structure.

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
    const { data: tenant } = await supabase.from('tenants').select('settings').eq('slug', slug).single();

    if (!tenant) {
        // LAZY INIT: Create default tenant for existing users
        const defaultSettings = {
            slug,
            license: { active: true, plan: 'starter' },
            ...DEFAULT_SETTINGS
        };
        const { error } = await supabase.from('tenants').insert([{ slug, settings: defaultSettings }]);

        if (error) {
            console.error("Error creating default tenant:", error);
            return { valid: false, reason: 'error' };
        }

        return { valid: true, plan: 'starter', reason: 'active' };
    }

    const license = tenant.settings?.license || { active: true, plan: 'starter' };

    // Check Limits for Starter Plan
    if (license.plan === 'starter') {
        const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_slug', slug)
            .neq('status', 'cancelled');

        if (count !== null && count >= 30) {
            return { valid: false, plan: 'starter', reason: 'limit_reached' };
        }
    }

    if (!license.active) return { valid: false, reason: 'expired' };

    return { valid: true, plan: license.plan, reason: 'active' };
}

// --- SUPER ADMIN ---
export async function getTenants() {
    const { data: tenants, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (error) return [];

    // Enrich with booking counts
    const enriched = await Promise.all(tenants.map(async (t) => {
        const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('tenant_slug', t.slug);
        const { data: user } = await supabase.from('users').select('name, email, phone').eq('slug', t.slug).single();
        return {
            ...t,
            bookingsCount: count || 0,
            owner: user || { name: 'Desconhecido', email: '-', phone: '-' }
        };
    }));
    return enriched;
}

export async function updateTenantStatus(slug: string, active: boolean) {
    const { data: tenant } = await supabase.from('tenants').select('settings').eq('slug', slug).single();
    if (!tenant) return { success: false };

    const newSettings = {
        ...tenant.settings,
        license: {
            ...tenant.settings.license,
            active: active
        }
    };

    await supabase.from('tenants').update({ settings: newSettings }).eq('slug', slug);
    return { success: true };
}

export async function deleteTenant(slug: string) {
    // Delete in order to avoid FK constraints if they exist (though we are loose)
    await supabase.from('bookings').delete().eq('tenant_slug', slug);
    await supabase.from('services').delete().eq('tenant_slug', slug);
    await supabase.from('professionals').delete().eq('tenant_slug', slug);
    await supabase.from('users').delete().eq('slug', slug);
    await supabase.from('tenants').delete().eq('slug', slug);
    return { success: true };
}
