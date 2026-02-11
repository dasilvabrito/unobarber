'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/app/auth-actions';
import PhoneInput from '@/components/PhoneInput';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [slug, setSlug] = useState('');
    const [phone, setPhone] = useState('');

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        setSlug(val);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 11 || cleanPhone[2] !== '9') {
            setError('Por favor, informe um número de celular válido com DDD (WhatsApp).');
            setLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        // Ensure slug is sanitized in the form data if needed, or rely on state
        formData.set('slug', slug);

        try {
            const result = await register(formData);
            if (result.success) {
                router.push(`/${result.slug}/admin`);
            } else {
                setError(result.message || 'Erro ao criar conta.');
            }
        } catch (err) {
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-salon-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-salon-gold/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-salon-brown/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-3xl font-bold text-salon-gold mb-2">
                        UNO<span className="text-white">BARBER</span>
                    </Link>
                    <h1 className="text-xl text-salon-stone">Crie sua conta grátis</h1>
                </div>

                <div className="bg-white/5 border border-salon-brown/30 p-8 rounded-2xl backdrop-blur-sm shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-salon-stone mb-1">Nome da Barbearia</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full bg-salon-black/50 border border-salon-brown/50 rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                placeholder="Ex: Barbearia do Zé"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-salon-stone mb-1">Endereço do Site (Slug)</label>
                            <div className="flex items-center bg-salon-black/50 border border-salon-brown/50 rounded-lg p-3 focus-within:border-salon-gold transition-colors">
                                <span className="text-salon-stone mr-1 text-sm">unobarber.com/</span>
                                <input
                                    name="slug"
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={handleSlugChange}
                                    className="bg-transparent text-white outline-none w-full placeholder-gray-600"
                                    placeholder="seu-negocio"
                                />
                            </div>
                            <p className="text-xs text-salon-stone mt-1">Este será o link para seus clientes agendarem.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-salon-stone mb-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-salon-black/50 border border-salon-brown/50 rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-salon-stone mb-1">WhatsApp</label>
                                <PhoneInput
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full bg-salon-black/50 border border-salon-brown/50 rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-salon-stone mb-1">Senha de Acesso</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-salon-black/50 border border-salon-brown/50 rounded-lg p-3 text-white focus:border-salon-gold outline-none"
                                placeholder="******"
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-salon-gold text-salon-black font-bold py-3 rounded-lg hover:bg-white transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Criando sua loja...' : '🚀 Começar Agora'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-salon-stone">
                        Já tem uma conta? <Link href="/login" className="text-salon-gold hover:underline">Fazer Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
