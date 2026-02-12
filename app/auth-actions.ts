'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { supabase } from './lib/supabase';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me-in-prod');

// --- Login Action ---
export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        return { success: false, message: 'Usuário não encontrado.' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return { success: false, message: 'Senha incorreta.' };
    }

    // Create JWT
    const token = await new SignJWT({
        sub: user.id,
        email: user.email,
        slug: user.slug,
        role: user.role
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
    });

    return { success: true, slug: user.slug };
}

// --- Register Action ---
export async function register(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const phone = formData.get('phone') as string;

    // 1. Check if email exists
    const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingEmail) {
        return { success: false, message: 'Email já cadastrado.' };
    }

    // 2. Check if slug exists
    const { data: existingSlug } = await supabase
        .from('users')
        .select('id')
        .eq('slug', slug)
        .single();

    if (existingSlug) {
        return { success: false, message: 'Este endereço de site já está em uso.' };
    }

    // 3. Create User in Supabase
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        email,
        password: hashedPassword,
        name,
        slug,
        phone,
        role: 'admin'
    };

    const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

    if (createError || !createdUser) {
        console.error("Error creating user:", createError);
        const urlDebug = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'UNDEFINED';
        return { success: false, message: `Erro ao criar usuário: ${createError?.message || 'Erro desconhecido'} (Code: ${createError?.code}) | URL: ${urlDebug}` };
    }

    // 4. Initialize Tenant Data (Settings & Services)
    // We can call the logic from actions.ts directly since we assume the user is created now.
    const { saveSettings, getServices } = await import('@/app/actions');

    // Initialize Settings
    await saveSettings(slug, {
        salonName: name,
        slug: slug,
        socialMedia: { whatsapp: phone },
        license: {
            active: true,
            expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // 1 Month Free Trial
            plan: 'trial'
        }
    });

    // Initialize Services (Implicitly done by getServices if not exists, but we can ensure it)
    await getServices(slug);

    // 5. Auto Login
    const token = await new SignJWT({
        sub: createdUser.id,
        email: createdUser.email,
        slug: createdUser.slug,
        role: createdUser.role
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
    });

    return { success: true, slug: createdUser.slug };
}

// --- Logout Action ---
export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
}

// --- Verification Helper (Server Components) ---
export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (e) {
        return null;
    }
}
