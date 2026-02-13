-- Adiciona colunas para controle de retorno/aviso
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS follow_up_date date,
ADD COLUMN IF NOT EXISTS follow_up_sent boolean DEFAULT false;

-- Atualiza o cache do PostgREST
NOTIFY pgrst, 'reload config';
