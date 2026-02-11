'use client';

import { login } from '@/app/auth-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const result = await login(formData);

        if (result.success) {
            router.push(`/${result.slug}/admin`);
        } else {
            setError(result.message || 'Falha no login');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-salon-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-salon-gold/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-salon-gold mb-2">Login Administrativo</h1>
                    <p className="text-salon-stone">Acesse o painel da sua barbearia</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-salon-stone mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-salon-black/50 border border-salon-brown/50 rounded-lg px-4 py-3 text-white focus:border-salon-gold focus:outline-none transition-colors"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-salon-stone mb-2">Senha</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-salon-black/50 border border-salon-brown/50 rounded-lg px-4 py-3 text-white focus:border-salon-gold focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-salon-gold text-salon-black font-bold py-3 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Acessar Painel'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-salon-stone">
                    <p>Esqueceu sua senha? Contate o suporte.</p>
                </div>
            </div>
        </div>
    );
}
