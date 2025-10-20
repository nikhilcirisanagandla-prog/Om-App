import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'No signature provided' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`✅ Webhook verified: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`💰 Checkout completed: ${session.id}`);
        console.log(`Customer: ${session.customer}`);
        console.log(`Subscription: ${session.subscription}`);
        
        // TODO: Update user subscription in your database
        // You'll want to use the Supabase client here to update the user's subscription status
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`🔄 Subscription updated: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        
        // TODO: Update subscription status in your database
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`❌ Subscription canceled: ${subscription.id}`);
        
        // TODO: Handle subscription cancellation in your database
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`✅ Invoice paid: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`⚠️ Invoice payment failed: ${invoice.id}`);
        
        // TODO: Handle failed payment (notify user, etc.)
        break;
      }

      default:
        console.log(`📝 Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
