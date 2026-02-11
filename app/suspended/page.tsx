import Link from 'next/link';

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-neutral-900 border-b-8 border-salon-gold flex items-center justify-center p-4">
            <div className="bg-black/50 p-8 rounded-2xl border border-red-500/30 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Serviço Suspenso</h1>
                <p className="text-gray-400 mb-8">
                    A licença de uso deste sistema expirou ou foi suspensa temporariamente.
                </p>

                <div className="bg-neutral-800 p-4 rounded-lg mb-8">
                    <p className="text-sm text-gray-400 mb-1">Para reativar o acesso, entre em contato:</p>
                    <p className="text-lg font-bold text-salon-gold">suporte@seusistema.com</p>
                    <p className="text-sm text-gray-500">(11) 99999-9999</p>
                </div>

                <Link
                    href="/"
                    className="text-salon-stone hover:text-white underline text-sm"
                >
                    Voltar para Home
                </Link>
            </div>
        </div>
    );
}
