
// src/app/api/paypal/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

async function getPayPalAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        throw new Error('PayPal client ID or secret is not configured.');
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(`${PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data.access_token;
}

async function verifyWebhookSignature(req: NextRequest, body: any): Promise<boolean> {
    if (!PAYPAL_WEBHOOK_ID) {
        console.error("PayPal webhook ID is not set.");
        return false;
    }
    try {
        const accessToken = await getPayPalAccessToken();
        const response = await axios.post(
            `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
            {
                auth_algo: req.headers.get('paypal-auth-algo'),
                cert_url: req.headers.get('paypal-cert-url'),
                transmission_id: req.headers.get('paypal-transmission-id'),
                transmission_sig: req.headers.get('paypal-transmission-sig'),
                transmission_time: req.headers.get('paypal-transmission-time'),
                webhook_id: PAYPAL_WEBHOOK_ID,
                webhook_event: body,
            },
            { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );
        return response.data.verification_status === 'SUCCESS';
    } catch (error: any) {
        console.error('Error verifying PayPal webhook signature:', error.response?.data || error.message);
        return false;
    }
}

async function handleSubscriptionActivated(resource: any) {
    const { custom_id, id: subscriptionId } = resource;
    
    if (!custom_id) {
        console.error('Webhook Error: Missing custom_id in subscription resource.');
        return;
    }

    try {
        const { userId, planId } = JSON.parse(custom_id);
        if (!userId || !planId) {
            console.error('Webhook Error: Malformed custom_id in subscription resource.', custom_id);
            return;
        }

        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            planId,
            subscriptionStatus: 'active',
            paypalSubscriptionId: subscriptionId,
        });
        console.log(`Successfully activated subscription for user ${userId} on plan ${planId}`);
    } catch (error) {
        console.error(`Firestore update failed for subscription activation:`, error);
        // This should trigger monitoring/alerts in a production environment
    }
}

async function handleSubscriptionCancelled(resource: any) {
    const { id: subscriptionId } = resource;
    // Note: custom_id is not always present in cancellation events.
    // A robust solution would involve querying your DB for the user with this subscriptionId.
    // For now, we'll assume we can get it or handle it in a more advanced version.
    console.log(`Subscription ${subscriptionId} has been cancelled.`);
    // To update your user, you would need to:
    // 1. Find user by `paypalSubscriptionId: subscriptionId` in Firestore.
    // 2. Update their `subscriptionStatus` to 'cancelled'.
}

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch (e) {
        console.error("Error parsing JSON body:", e);
        return new NextResponse('Invalid JSON body', { status: 400 });
    }

    const isVerified = await verifyWebhookSignature(req, body);
    if (!isVerified) {
        console.warn('Webhook signature verification failed.');
        return new NextResponse('Webhook signature verification failed.', { status: 401 });
    }

    const eventType = body.event_type;
    const resource = body.resource;

    switch(eventType) {
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
            await handleSubscriptionActivated(resource);
            break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
            await handleSubscriptionCancelled(resource);
            break;
        // You can add more event types here, e.g., BILLING.SUBSCRIPTION.EXPIRED
        default:
            console.log(`Unhandled PayPal webhook event type: ${eventType}`);
    }

    return new NextResponse('Webhook received', { status: 200 });
}
