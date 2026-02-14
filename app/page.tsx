import Link from 'next/link';

export default function SaaSLanding() {
    return (
        <main className="min-h-screen bg-salon-black text-white relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-salon-black via-[#1a1512] to-salon-brown opacity-20"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-salon-gold/5 blur-[100px] rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-salon-brown/10 blur-[100px] rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <header className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="text-2xl font-bold text-salon-gold flex items-center gap-2">
                    <span className="text-3xl">💈</span>
                    <span>UNOBARBER</span>
                </div>
                <nav className="hidden md:flex gap-8 items-center bg-salon-black/50 px-6 py-2 rounded-full border border-salon-gold/10 backdrop-blur-sm">
                    <a href="#features" className="text-salon-stone hover:text-white transition-colors">Funcionalidades</a>
                    <a href="#solution" className="text-salon-stone hover:text-white transition-colors">Solução</a>
                    <a href="#pricing" className="text-salon-stone hover:text-white transition-colors">Planos</a>
                    <a href="#faq" className="text-salon-stone hover:text-white transition-colors">FAQ</a>
                </nav>
                <div className="flex gap-4">
                    <Link
                        href="/demo-barber"
                        className="hidden md:block text-salon-stone hover:text-white transition-colors py-2"
                    >
                        Ver Demo
                    </Link>
                    <Link
                        href="/register"
                        className="bg-salon-gold text-salon-black font-bold px-6 py-2 rounded-full hover:bg-white transition-all shadow-lg shadow-salon-gold/20"
                    >
                        Criar Conta
                    </Link>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative z-10 pt-20 pb-32 text-center px-4">
                <div className="inline-block mb-6 px-4 py-1 rounded-full bg-salon-gold/10 border border-salon-gold/20 text-salon-gold text-sm font-semibold tracking-wide uppercase">
                    🚀 A plataforma nº 1 para Barbearias Modernas
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                    Transforme sua Barbearia <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-salon-gold via-[#fceeb5] to-salon-gold">Em Uma Máquina de Vendas</span>
                </h1>
                <p className="text-xl md:text-2xl text-salon-stone max-w-3xl mx-auto mb-10 leading-relaxed">
                    Mais que agenda: Uma Inteligência de Retorno que traz seu cliente de volta
                    automaticamente e valida cada WhatsApp para acabar com os furos.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/register"
                        className="px-8 py-4 bg-salon-gold text-salon-black text-lg font-bold rounded-xl hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center gap-2"
                    >
                        Começar Grátis Agora
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Link>
                    <Link
                        href="/demo-barber"
                        className="px-8 py-4 bg-salon-black/50 border border-salon-stone/30 text-white text-lg font-bold rounded-xl hover:bg-salon-black hover:border-salon-gold transition-all backdrop-blur-sm"
                    >
                        Ver Exemplo Real
                    </Link>
                </div>

                <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-salon-gold/20 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-salon-black via-transparent to-transparent z-10"></div>
                    {/* Placeholder for App Screenshot - Using a CSS mockup for now */}
                    <div className="bg-[#1a1a1a] aspect-video w-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                        <div className="z-0 text-salon-stone flex flex-col items-center">
                            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-salon-black to-gray-900 opacity-90"></div>
                            <div className="relative z-10 p-8 border border-salon-gold/10 rounded-xl bg-salon-black/80 backdrop-blur-md shadow-2xl max-w-2xl w-full">
                                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="text-salon-stone text-xs">unobarber.com/seu-negocio</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-8 bg-white/5 rounded w-3/4 mx-auto"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-24 bg-salon-gold/10 rounded border border-salon-gold/20"></div>
                                        <div className="h-24 bg-white/5 rounded border border-white/10"></div>
                                    </div>
                                    <div className="h-8 bg-white/5 rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PAIN POINTS SECTION */}
            <section id="solution" className="py-24 bg-white/5 relative">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                                Cansado de passar o dia respondendo <span className="text-green-400">WhatsApp?</span>
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xl">✕</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Perda de Tempo</h3>
                                        <p className="text-salon-stone">Horas perdidas confirmando horários manualmente todos os dias.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xl">✕</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Furos na Agenda</h3>
                                        <p className="text-salon-stone">Clientes esquecem e você perde dinheiro sem cobrança de sinal.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-xl">✕</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Desorganização</h3>
                                        <p className="text-salon-stone">Financeiro misturado com pessoal e falta de histórico.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-salon-gold/20 blur-3xl rounded-full opacity-50"></div>
                            <div className="relative bg-salon-black border border-salon-gold/30 p-8 rounded-2xl shadow-2xl">
                                <h3 className="text-2xl font-bold text-salon-gold mb-6 border-b border-salon-gold/20 pb-4">A Solução UnoBarber</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✔</div>
                                        <span>Link de agendamento automático 24h</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✔</div>
                                        <span>Site profissional com sua marca</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✔</div>
                                        <span>Gestão financeira simplificada</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✔</div>
                                        <span>Lembretes automáticos para clientes</span>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                    <Link href="/dashboard" className="text-salon-gold font-bold hover:underline">Experimente Grátis &rarr;</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section id="features" className="py-24 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Inovações que Ninguém Tem</h2>
                        <p className="text-salon-stone max-w-2xl mx-auto">Tecnologia de ponta desenvolvida para resolver problemas reais de barbearias.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "✅", title: "Validação Anti-Fake", desc: "Nosso sistema verifica se o WhatsApp é real e exige formato válido (11 dígitos) antes de agendar." },
                            { icon: "🔄", title: "Gestão de Retorno (LTV)", desc: "O sistema sabe quando o cliente deve voltar e gera uma lista de 'Retornos Pendentes' para você." },
                            { icon: "⚡", title: "Login Sem Senha", desc: "Seu cliente entra apenas com o número do celular. Sem cadastros longos, sem esquecer senhas." },
                            { icon: "🎨", title: "Sua Marca, Seu Domínio", desc: "Personalize tudo: Cores, Logo e tenha um link exclusivo (ex: unobarber.com/SuaBarbearia)." },
                            { icon: "🧠", title: "Agendamento Inteligente", desc: "Cálculo automático de duração de combos e prevenção de conflitos de horários em tempo real." },
                            { icon: "📈", title: "Raio-X Financeiro", desc: "Saiba exatamente quanto faturou hoje, ontem e no mês. Previsibilidade total de ganhos." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-[#1e1e1e] border border-salon-gold/5 hover:border-salon-gold/50 transition-all hover:-translate-y-1 group">
                                <div className="w-14 h-14 bg-salon-gold/10 rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:bg-salon-gold group-hover:text-black transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-salon-stone leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section id="pricing" className="py-24 bg-salon-black border-t border-salon-brown/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Planos Simples e Transparentes</h2>
                        <p className="text-salon-stone">Sem fidelidade. Cancele quando quiser.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Tier */}
                        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-2">Iniciante</h3>
                            <div className="text-4xl font-bold text-white mb-6">R$ 0<span className="text-lg text-salon-stone font-normal">/mês</span></div>
                            <ul className="space-y-4 mb-8 text-salon-stone">
                                <li className="flex gap-2"><span>✔</span> 50 agendamentos/mês</li>
                                <li className="flex gap-2"><span>✔</span> Site básico</li>
                                <li className="flex gap-2"><span>✔</span> 1 Profissional</li>
                            </ul>
                            <Link href="/dashboard" className="block w-full py-3 text-center border border-white/30 rounded-lg text-white hover:bg-white hover:text-black font-bold transition-all">
                                Começar Grátis
                            </Link>
                        </div>

                        {/* Pro Tier (Featured) */}
                        <div className="p-8 rounded-2xl border-2 border-salon-gold bg-salon-gold/5 transform md:-translate-y-4 relative">
                            <div className="absolute top-0 right-0 bg-salon-gold text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">MAIS POPULAR</div>
                            <h3 className="text-xl font-bold text-salon-gold mb-2">Profissional</h3>
                            <div className="text-4xl font-bold text-white mb-6">R$ 29,90<span className="text-lg text-salon-stone font-normal">/mês</span></div>
                            <ul className="space-y-4 mb-8 text-white">
                                <li className="flex gap-2"><span className="text-salon-gold">✔</span> Agendamentos Ilimitados</li>
                                <li className="flex gap-2"><span className="text-salon-gold">✔</span> Site 100% Personalizado</li>
                                <li className="flex gap-2"><span className="text-salon-gold">✔</span> Até 5 Profissionais</li>
                                <li className="flex gap-2"><span className="text-salon-gold">✔</span> Notificações WhatsApp</li>
                                <li className="flex gap-2"><span className="text-salon-gold">✔</span> Gestão Financeira</li>
                            </ul>
                            <Link href="/dashboard" className="block w-full py-3 text-center bg-salon-gold rounded-lg text-black hover:bg-white font-bold transition-all shadow-lg shadow-salon-gold/20">
                                Assinar Profissional
                            </Link>
                        </div>

                        {/* Enterprise Tier */}
                        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-2">Rede / Franquia</h3>
                            <div className="text-4xl font-bold text-white mb-6">Sob Consulta</div>
                            <ul className="space-y-4 mb-8 text-salon-stone">
                                <li className="flex gap-2"><span>✔</span> Múltiplas Unidades</li>
                                <li className="flex gap-2"><span>✔</span> Painel Unificado</li>
                                <li className="flex gap-2"><span>✔</span> API Dedicada</li>
                                <li className="flex gap-2"><span>✔</span> Suporte 24/7</li>
                            </ul>
                            <Link href="#contact" className="block w-full py-3 text-center border border-white/30 rounded-lg text-white hover:bg-white hover:text-black font-bold transition-all">
                                Falar com Vendas
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 bg-salon-black">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { q: "Preciso instalar algum programa?", a: "Não. O UnoBarber funciona direto no navegador do computador ou celular." },
                            { q: "Posso usar meu próprio domínio?", a: "Sim. No plano Profissional você pode conectar seu domínio (ex: suabarbearia.com.br)." },
                            { q: "Como recebo os pagamentos?", a: "Você pode configurar para receber na hora (presencial) ou integrar com gateways de pagamento online." },
                            { q: "Tem fidelidade?", a: "Nenhuma. Você pode cancelar sua assinatura a qualquer momento sem multa." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/5 hover:border-salon-gold/30 transition-colors">
                                <h3 className="font-bold text-white mb-2">{item.q}</h3>
                                <p className="text-salon-stone">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-20 border-t border-salon-brown/30 bg-gradient-to-b from-salon-black to-[#1a1512] text-center px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Pronto para modernizar seu negócio?</h2>
                    <p className="text-xl text-salon-stone mb-10">Junte-se a centenas de barbearias que já usam UnoBarber.</p>
                    <Link
                        href="/register"
                        className="inline-block px-12 py-5 bg-salon-gold text-salon-black text-xl font-bold rounded-full hover:bg-white transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] transform hover:scale-105"
                    >
                        Criar Conta Gratuita
                    </Link>
                    <p className="text-sm text-salon-stone mt-6">Não requer cartão de crédito • Cancelamento grátis</p>
                </div>
            </section>

            <footer className="py-10 border-t border-salon-brown/30 bg-salon-black text-center text-salon-stone text-sm">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; 2026 UnoBarber SaaS. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-salon-gold">Termos de Uso</a>
                        <a href="#" className="hover:text-salon-gold">Privacidade</a>
                        <a href="#" className="hover:text-salon-gold">Suporte</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
