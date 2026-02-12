-- PERMISSÕES GERAIS PARA A TABELA TENANTS
-- Habilitar RLS para garantir que as políticas funcionem (ou desabilitar se preferir acesso total sem policies, mas policies true é melhor)
alter table tenants enable row level security;

-- Remover políticas antigas para evitar conflitos
drop policy if exists "Enable read access for all users" on tenants;
drop policy if exists "Enable insert for all users" on tenants;
drop policy if exists "Enable update for all users" on tenants;
drop policy if exists "All Tenants Public" on tenants;

-- Criar política permissiva TOTAL (Select, Insert, Update, Delete) para todos (Anon e Authenticated)
-- Isso resolve o problema do 'Serviço Suspenso' (leitura da licença) e 'Não Salva Configurações' (update)
create policy "All Tenants Public"
on tenants
for all
using (true)
with check (true);

-- Garantir também para SERVICES e PROFESSIONALS se ainda não tiverem
alter table services enable row level security;
drop policy if exists "All Services Public" on services;
create policy "All Services Public" on services for all using (true) with check (true);

alter table professionals enable row level security;
drop policy if exists "All Professionals Public" on professionals;
create policy "All Professionals Public" on professionals for all using (true) with check (true);

-- Reforçar Bookings
alter table bookings enable row level security;
drop policy if exists "All Bookings Public" on bookings;
create policy "All Bookings Public" on bookings for all using (true) with check (true);
