const ASAAS_API_URL = process.env.NODE_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api.asaas.com/v3'; // Using prod URL as user provided prod key, usually sandbox is 'https://sandbox.asaas.com/v3'

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export async function createCustomer(name: string, cpfCnpj: string, email: string, phone: string) {
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    console.log("Creating Asaas Customer:", { name, cpfCnpj, email });

    // 1. Check if customer exists (by email or cpf) could be good, but Asaas allows duplicates. 
    // We will just create for now or assume the user saves the ID if we decided to store it (we haven't planned to store customer_id on users table yet, but we might need to).
    // Actually, good practice is to search first.

    // Simple implementation: Create new.
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        },
        body: JSON.stringify({
            name,
            cpfCnpj,
            email,
            mobilePhone: phone,
            notificationDisabled: false
        })
    });

    const data = await response.json();
    if (data.errors) {
        console.error("Asaas Create Customer Error:", data.errors);
        throw new Error(`Erro ao criar cliente no Asaas: ${data.errors[0].description}`);
    }

    return data.id;
}

export async function createCharge(customerId: string, value: number, dueDate: string, description: string) {
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        },
        body: JSON.stringify({
            customer: customerId,
            billingType: 'BOLETO', // Or 'PIX', 'CREDIT_CARD'. User mentioned "boleto gerado", but Asaas link usually offers multiple if configured.
            value,
            dueDate,
            description,
            cycle: 'MONTHLY' // Optional, strictly we are generating one-off based on trigger but labeling as monthly subscription
        })
    });

    const data = await response.json();
    if (data.errors) {
        console.error("Asaas Create Charge Error:", data.errors);
        throw new Error(`Erro ao gerar cobrança: ${data.errors[0].description}`);
    }

    return {
        id: data.id,
        invoiceUrl: data.bankSlipUrl || data.invoiceUrl || data.billingType === 'PIX' ? data.invoiceUrl : data.invoiceUrl
    };
}

export async function getPaymentStatus(paymentId: string) {
    if (!ASAAS_API_KEY) throw new Error("ASAAS_API_KEY not configured");

    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
        headers: {
            'access_token': ASAAS_API_KEY
        }
    });

    const data = await response.json();
    return data.status; // PENDING, RECEIVED, OVERDUE, etc.
}
