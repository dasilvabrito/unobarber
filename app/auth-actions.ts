'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me-in-prod');

// --- Helper: Get Users ---
function getUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// --- Login Action ---
export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const users = getUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
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

    const users = getUsers();

    // 1. Check if email exists
    if (users.find((u: any) => u.email === email)) {
        return { success: false, message: 'Email já cadastrado.' };
    }

    // 2. Check if slug exists
    if (users.find((u: any) => u.slug === slug)) {
        return { success: false, message: 'Este endereço de site já está em uso.' };
    }

    // 3. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword,
        name,
        slug,
        phone,
        role: 'admin',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    // 4. Initialize Tenant Data (Settings & Services)
    const { saveSettings, saveService, getServices } = await import('@/app/actions');

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
        sub: newUser.id,
        email: newUser.email,
        slug: newUser.slug,
        role: newUser.role
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

    return { success: true, slug: newUser.slug };
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
