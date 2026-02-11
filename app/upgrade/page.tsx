'use client';

import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { useState } from "react";

export default function UpgradePage() {
    return (
        <div className="min-h-screen bg-salon-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h1 className="text-3xl font-bold text-salon-gold mb-4">Você Cresceu!</h1>
                <p className="text-salon-stone text-lg mb-8">
                    Parabéns! Você atingiu o limite de <strong className="text-white">40 agendamentos gratuitos</strong>. Isso significa que sua barbearia está bombando!
                </p>

                <div className="bg-salon-black border border-salon-gold/30 rounded-2xl p-6 mb-8 relative overflow-hidden group hover:border-salon-gold transition-all">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-salon-gold to-transparent"></div>

                    <h2 className="text-xl font-bold text-white mb-2">Plano Pro</h2>
                    <div className="flex justify-center items-baseline gap-1 mb-4">
                        <span className="text-sm text-salon-stone">R$</span>
                        <span className="text-4xl font-bold text-salon-gold">29,90</span>
                        <span className="text-sm text-salon-stone">/mês</span>
                    </div>

                    <ul className="text-left text-sm text-salon-stone space-y-3 mb-6">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✔</span> Agendamentos Ilimitados
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✔</span> Lembretes Automáticos no WhatsApp
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✔</span> Relatórios Financeiros
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✔</span> Suporte Prioritário
                        </li>
                    </ul>

                    {/* Dynamic Asaas Payment Link */}
                    <button
                        onClick={async () => {
                            try {
                                const { startSubscription } = await import('@/app/actions');
                                // We need the slug here. If not in params, we might need to fetch or infer it.
                                // Upgrade page might be at /upgrade or /[slug]/upgrade? 
                                // Checking file structure: app/upgrade/page.tsx. 
                                // It seems to be a global page? Or maybe tenant specific?
                                // If global, we need to know WHICH tenant is upgrading.
                                // Let's assume for now it is accessed via a flow where we know the slug or checking the URL.
                                // However, this file is app/upgrade/page.tsx, so route is /upgrade.
                                // We probably need to pass the slug as a search param? ?slug=...
                                // Let's use searchParams.
                                const params = new URLSearchParams(window.location.search);
                                const slug = params.get('slug');

                                if (!slug) {
                                    alert("Erro: Barbearia não identificada.");
                                    return;
                                }

                                const result = await startSubscription(slug);
                                if (result.success && result.url) {
                                    window.open(result.url, '_blank');
                                } else {
                                    alert(result.message || "Erro ao gerar link de pagamento.");
                                }
                            } catch (e) {
                                console.error(e);
                                alert("Erro interno ao processar pagamento.");
                            }
                        }}
                        className="block w-full bg-salon-gold text-salon-black font-bold py-3 rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-lg shadow-salon-gold/20"
                    >
                        Assinar Agora
                    </button>
                    <p className="text-[10px] text-salon-stone mt-3">Pagamento seguro via Asaas (Pix/Boleto/Cartão)</p>
                </div>

                <Link href="/dashboard" className="text-salon-stone text-sm hover:text-white underline">
                    Voltar para Home (Visualizar apenas)
                </Link>
            </div>
        </div>
    );
}
