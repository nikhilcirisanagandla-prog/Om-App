import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature || !endpointSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing signature or webhook secret' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // TODO: Update your database with the subscription details
        // Example: Update user's subscription status in Supabase
        // const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        // const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        // const supabase = createClient(supabaseUrl, supabaseKey);
        // await supabase.from('subscriptions').insert({ ... });
        
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        // TODO: Handle subscription updates
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        // TODO: Handle subscription cancellation
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        // TODO: Handle successful payment
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', failedInvoice.id);
        // TODO: Handle failed payment
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
