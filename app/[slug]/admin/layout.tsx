import { logout } from '@/app/auth-actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Check 2: Check License (Added)
    const { validateLicense } = await import('@/app/actions');
    const license = await validateLicense(slug);
    if (!license.valid) {
        if (license.reason === 'limit_reached') {
            redirect(`/upgrade?slug=${slug}`);
        }
        redirect('/suspended');
    }

    return (
        <div className="min-h-screen bg-salon-black text-white">
            <header className="bg-salon-black border-b border-salon-gold/20 p-4 sticky top-0 z-50 backdrop-blur-md">
                <div className="bg-red-500 text-white text-xs p-1 text-center font-bold">MODE DEBUG: {slug} | Valid: {license.valid ? 'YES' : 'NO'} | Reason: {license.reason}</div>
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-salon-gold">Painel Administrativo</h1>
                    <div className="flex gap-4 items-center">
                        <Link href={`/${slug}`} target="_blank" className="text-sm text-salon-stone hover:text-white flex items-center gap-1">
                            Ver Site <span className="text-xs">↗</span>
                        </Link>
                        <form action={logout}>
                            <button className="text-sm bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                Sair
                            </button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 py-8">
                {children}
            </main>
        </div>
    );
}
