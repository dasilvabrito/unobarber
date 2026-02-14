'use client';

import { useState, useEffect } from 'react';

export default function SuperAdminPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(false);
    const [key, setKey] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({ email: '', password: '' });

    useEffect(() => {
        const storedKey = localStorage.getItem('saas_admin_key');
        if (storedKey === '@Valdiceia1') { // Simple protection
            setAuth(true);
            fetchTenants();
        }
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const { getTenants } = await import('@/app/actions');
            const data = await getTenants();
            setTenants(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (slug: string, currentStatus: boolean) => {
        if (!confirm(`Deseja ${currentStatus ? 'BLOQUEAR' : 'ATIVAR'} este cliente?`)) return;

        try {
            const { updateTenantStatus } = await import('@/app/actions');
            await updateTenantStatus(slug, !currentStatus);
            fetchTenants();
        } catch (error) {
            alert("Erro ao atualizar.");
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm(`TEM CERTEZA? Isso excluirá TODOS os dados de ${slug} (agendamentos, serviços, usuário). Essa ação é irreversível.`)) return;

        const confirm2 = prompt(`Digite "${slug}" para confirmar a exclusão:`);
        if (confirm2 !== slug) {
            alert("Exclusão cancelada (nome incorreto).");
            return;
        }

        try {
            const { deleteTenant } = await import('@/app/actions');
            await deleteTenant(slug);
            alert("Cliente excluído com sucesso.");
            fetchTenants();
        } catch (error) {
            alert("Erro ao excluir.");
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            // Dynamically import to avoid server-side issues in client component if strict
            const { updateUserCredentials } = await import('@/app/auth-actions');

            // Only send fields that have values
            const updates: any = {};
            if (editForm.email) updates.email = editForm.email;
            if (editForm.password) updates.password = editForm.password;

            const result = await updateUserCredentials(editingUser.slug, updates);

            if (result.success) {
                alert("Usuário atualizado com sucesso!");
                setEditingUser(null);
                setEditForm({ email: '', password: '' });
                fetchTenants();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar usuário.");
        }
    };

    if (!auth) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-sm">
                    <h1 className="text-xl font-bold mb-4 text-center">Acesso Restrito</h1>
                    <input
                        type="password"
                        placeholder="Chave de Acesso"
                        className="w-full bg-black border border-gray-700 rounded p-3 text-white mb-4"
                        value={key}
                        onChange={e => setKey(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            if (key === '@Valdiceia1') {
                                localStorage.setItem('saas_admin_key', key);
                                setAuth(true);
                                fetchTenants();
                            } else {
                                alert("Chave inválida");
                            }
                        }}
                        className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200"
                    >
                        Entrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Painel do Dono (Super Admin)</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('saas_admin_key');
                            setAuth(false);
                        }}
                        className="text-red-400 hover:text-white"
                    >
                        Sair
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Carregando clientes...</div>
                ) : (
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Cliente / Slug</th>
                                    <th className="p-4">Contato</th>
                                    <th className="p-4">Plano</th>
                                    <th className="p-4 text-center">Agendamentos</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {tenants.map(t => {
                                    const license = t.settings?.license || { active: true, plan: 'starter' };
                                    return (
                                        <tr key={t.slug} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-bold text-white">{t.owner.name}</div>
                                                    <div className="text-sm text-gray-500 font-mono">/{t.slug}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">
                                                <div>{t.owner.email}</div>
                                                <div>{t.owner.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${license.plan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {license.plan}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-white">
                                                {t.bookingsCount}
                                            </td>
                                            <td className="p-4 text-center">
                                                {license.active ? (
                                                    <span className="text-green-500 font-bold text-sm">ATIVO</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold text-sm">BLOQUEADO</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => toggleStatus(t.slug, license.active)}
                                                    className={`px-3 py-1 rounded text-xs font-bold ${license.active ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black'}`}
                                                >
                                                    {license.active ? 'BLOQUEAR' : 'ATIVAR'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.slug)}
                                                    className="px-3 py-1 rounded text-xs font-bold bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white ml-2"
                                                    title="Excluir Permanentemente"
                                                >
                                                    🗑️ Excluir
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(t);
                                                        setEditForm({ email: t.owner.email, password: '' });
                                                    }}
                                                    className="px-3 py-1 rounded text-xs font-bold bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white ml-2"
                                                    title="Editar Usuário"
                                                >
                                                    ✏️ Editar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {tenants.length === 0 && (
                            <div className="p-8 text-center text-gray-500">Nenhum cliente cadastrado ainda.</div>
                        )}
                    </div>
                )}

                {/* Edit User Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm">
                            <h2 className="text-xl font-bold text-white mb-4">Editar Acesso: {editingUser.owner.name}</h2>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Novo Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                                        placeholder={editingUser.owner.email}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Nova Senha</label>
                                    <input
                                        type="text"
                                        value={editForm.password}
                                        onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                                        placeholder="Deixe em branco para manter"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Preencha apenas se quiser alterar a senha.</p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="flex-1 py-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
