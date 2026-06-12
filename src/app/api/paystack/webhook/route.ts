// src/app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Paystack webhook secret is not set.");
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature') as string;

  const hash = crypto
    .createHmac('sha512', webhookSecret)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    console.error('Webhook signature verification failed.');
    return new NextResponse('Webhook Error: Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle successful subscription creation
  if (event.event === 'subscription.create') {
    const { customer, plan, subscription_code } = event.data;
    const metadata = customer.metadata || {};
    const userId = metadata.user_id;
    const planId = metadata.plan_id;

    if (!userId || !planId) {
      console.error('Missing userId or planId in webhook metadata');
      return new NextResponse('Webhook Error: Missing metadata', { status: 400 });
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        planId: planId,
        subscriptionStatus: 'active',
        paystackCustomerId: customer.customer_code,
        paystackSubscriptionId: subscription_code,
      });
      console.log(`Successfully updated user ${userId} to plan ${planId}`);
    } catch (error) {
      console.error(`Error updating user document in Firestore:`, error);
      return new NextResponse('Error updating user in database', { status: 500 });
    }
  }

  // Handle other events like 'subscription.disable', etc.
  if (event.event === 'subscription.disable') {
     const { customer, subscription_code } = event.data;
     const metadata = customer.metadata || {};
     const userId = metadata.user_id;

     if (userId) {
         try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                subscriptionStatus: 'cancelled',
            });
            console.log(`Successfully cancelled subscription for user ${userId}`);
         } catch (error) {
            console.error(`Error updating user subscription status:`, error);
         }
     }
  }

  return new NextResponse('Webhook received', { status: 200 });
}
