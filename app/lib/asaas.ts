import { getSettings } from "@/app/actions";

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

async function fetchAsaas(endpoint: string, options: any = {}) {
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const url = `${ASAAS_API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.errors?.[0]?.description || 'Asaas API Error');
    }

    return data;
}

export async function createAsaasCustomer(slug: string) {
    // Get Tenant Info
    const settings = await getSettings(slug);

    // Simplification: We need at least Name and Email. 
    // If not in settings, we might need a more robust User model fetch.
    // For now assuming settings has basic info or we use defaults.
    // In a real app, you'd fetch the Owner User.

    // Try to find users file to get email? 
    // Or just use what we have in settings if implemented.
    // Let's assume we pass the necessary info to this function or fetch it.

    // Quick Fix: We need to Fetch the User associated with this slug to get the Email/CPF.
    // Since we don't have a direct "Get User By Slug" exported easily, let's look at `users.json`
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'data', 'users.json');
    let email = `contato@${slug}.com.br`; // Fallback
    let name = settings.salonName;
    let cpfCnpj = '';

    if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
        const owner = users.find((u: any) => u.slug === slug);
        if (owner) {
            email = owner.email;
            name = owner.name;
            cpfCnpj = owner.cpf || ''; // Need to add CPF to registration if we want formal billing
        }
    }

    // 1. Check if customer exists by email
    const existing = await fetchAsaas(`/customers?email=${email}`);
    if (existing.data && existing.data.length > 0) {
        return existing.data[0].id;
    }

    // 2. Create Customer
    const newCustomer = await fetchAsaas('/customers', {
        method: 'POST',
        body: JSON.stringify({
            name: name,
            email: email,
            externalReference: slug,
            // cpfCnpj: cpfCnpj // Optional for now, but recommended for Boleto
        })
    });

    return newCustomer.id;
}

export async function createSubscription(slug: string) {
    const customerId = await createAsaasCustomer(slug);

    // Create Subscription
    const subscription = await fetchAsaas('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
            customer: customerId,
            billingType: 'UNDEFINED', // Allows customer to choose (PIX/BOLETO/CARD)
            value: 5.00, // TEST VALUE: Reduced for testing (Min R$ 5,00 usually)
            nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
            cycle: 'MONTHLY',
            description: 'Assinatura UnoBarber Pro (TESTE)',
            externalReference: slug // CRITICAL: This links the payment to the tenant
        })
    });

    return subscription.invoiceUrl || subscription.billUrl; // billUrl usually directs to payment page
}

export async function getSubscriptionHistory(slug: string) {
    try {
        const customerId = await createAsaasCustomer(slug); // Ensure we have the customer ID
        // Fetch payments for this customer
        const payments = await fetchAsaas(`/payments?customer=${customerId}&limit=10`);
        return payments.data.map((p: any) => ({
            id: p.id,
            date: p.dateCreated,
            dueDate: p.dueDate,
            value: p.value,
            status: p.status,
            description: p.description,
            invoiceUrl: p.invoiceUrl || p.bankSlipUrl || p.transactionReceiptUrl
        }));
    } catch (error) {
        console.error("Error fetching subscription history:", error);
        return [];
    }
}
