// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// --- PAYPAL CONFIG ---
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

const paypalPlanIds: Record<string, string> = {
    creative: process.env.PAYPAL_CREATIVE_PLAN_ID || 'P-XXXXXXXXXXXXXXXXXXXX',
    growth: process.env.PAYPAL_GROWTH_PLAN_ID || 'P-YYYYYYYYYYYYYYYYYYYY',
};

async function getPayPalAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('PayPal client ID or secret is not configured.');
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(`${PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token;
}

// --- PAYSTACK CONFIG ---
const paystackPlanCodes: Record<string, string> = {
    creative: process.env.PAYSTACK_CREATIVE_PLAN_CODE || 'PLN_xxxxxxxxxxxxxxx',
    growth: process.env.PAYSTACK_GROWTH_PLAN_CODE || 'PLN_yyyyyyyyyyyyyyy',
};


export async function POST(req: NextRequest) {
    try {
        const { planId, userId, userEmail, currency } = await req.json();

        if (!planId || !userId || !userEmail || !currency) {
            return new NextResponse('Missing required parameters', { status: 400 });
        }
        
        const appUrl = process.env.APP_URL || 'http://localhost:9002';
        let approvalUrl: string;

        // Determine which payment gateway to use based on currency
        if (currency === 'ZAR') {
            // --- PAYSTACK LOGIC ---
            const planCode = paystackPlanCodes[planId];
            if (!planCode) return new NextResponse(`Invalid planId for Paystack: ${planId}`, { status: 400 });

            const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
            if (!paystackSecret) throw new Error('Paystack secret key is not configured.');

            const response = await axios.post('https://api.paystack.co/transaction/initialize', {
                email: userEmail,
                plan: planCode,
                callback_url: `${appUrl}/dashboard?payment=success`,
                metadata: {
                    user_id: userId,
                    plan_id: planId,
                    cancel_action: `${appUrl}/pricing?payment=cancelled`,
                },
            }, {
                headers: { Authorization: `Bearer ${paystackSecret}`, 'Content-Type': 'application/json' },
            });
            
            if (!response.data.status || !response.data.data.authorization_url) {
                throw new Error(response.data.message || 'Error creating Paystack session');
            }
            approvalUrl = response.data.data.authorization_url;

        } else {
            // --- PAYPAL LOGIC (for USD, GBP, EUR) ---
            const paypalPlanId = paypalPlanIds[planId];
            if (!paypalPlanId) return new NextResponse(`Invalid planId for PayPal: ${planId}`, { status: 400 });

            const accessToken = await getPayPalAccessToken();

            const response = await axios.post(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
                plan_id: paypalPlanId,
                custom_id: JSON.stringify({ userId, planId }),
                application_context: {
                    brand_name: 'NurseryNet',
                    return_url: `${appUrl}/dashboard?payment=success`,
                    cancel_url: `${appUrl}/pricing?payment=cancelled`,
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'SUBSCRIBE_NOW',
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `sub-${Date.now()}`,
                },
            });

            const link = response.data.links.find((link: any) => link.rel === 'approve')?.href;
            if (!link) throw new Error('Could not get PayPal approval URL.');
            approvalUrl = link;
        }

        return NextResponse.json({ approvalUrl });

    } catch (error: any) {
        console.error('[CHECKOUT_ERROR]', error.response ? error.response.data : error.message);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error during checkout.' }),
            { status: 500 }
        );
    }
}
