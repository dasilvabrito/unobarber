import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { updateTenantStatus } from '@/app/actions';

export async function POST(req: NextRequest) {
    try {
        const event = await req.json();
        const { event: eventType, payment } = event;

        if (!payment || !payment.id) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        console.log(`Received Asaas Webhook: ${eventType} for payment ${payment.id}`);

        // 1. Handle Payment Received
        if (eventType === 'PAYMENT_RECEIVED' || eventType === 'PAYMENT_CONFIRMED') {
            // Update Billing Status
            const { error } = await supabase
                .from('billings')
                .update({ status: 'PAID' })
                .eq('asaas_payment_id', payment.id);

            if (error) {
                console.error("Error updating billing:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // Unblock Tenant (Get slug involves fetching billing first)
            const { data: billing } = await supabase.from('billings').select('slug').eq('asaas_payment_id', payment.id).single();
            if (billing) {
                await updateTenantStatus(billing.slug, true);
                console.log(`Tenant ${billing.slug} unblocked/activated.`);
            }
        }

        // 2. Handle Payment Overdue
        else if (eventType === 'PAYMENT_OVERDUE') {
            await supabase
                .from('billings')
                .update({ status: 'OVERDUE' })
                .eq('asaas_payment_id', payment.id);

            // We allow checkUsageAndBill to handle blocking logic via grace period
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Webhook Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
