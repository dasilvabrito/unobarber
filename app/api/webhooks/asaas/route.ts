import { NextResponse } from 'next/server';
import { renewLicense } from '@/app/actions';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('asaas-access-token');
        const secret = process.env.ASAAS_WEBHOOK_SECRET || 'demo-secret';

        // 1. Security Check (Optional but recommended)
        if (token !== secret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const event = await request.json();

        // 2. Filter Event Type
        if (event.event !== 'PAYMENT_CONFIRMED' && event.event !== 'PAYMENT_RECEIVED') {
            return NextResponse.json({ message: 'Ignored event' });
        }

        // 3. Extract Tenant Slug
        // We expect the 'externalReference' field in Asaas to contain the tenant slug
        const slug = event.payment.externalReference;

        if (!slug) {
            return NextResponse.json({ error: 'No externalReference found' }, { status: 400 });
        }

        // 4. Renew License
        // Default to adding 1 month
        const result = await renewLicense(slug, 1);

        return NextResponse.json({
            success: true,
            message: `License renewed for ${slug}`,
            newExpiration: result.expirationDate
        });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
