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
        
        // Update user's subscription status in Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        if (supabaseUrl && supabaseServiceKey) {
          const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          const userId = session.client_reference_id || session.metadata?.user_id;
          
          if (userId && session.subscription) {
            // Calculate next due date based on subscription
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const nextDueDate = new Date(subscription.current_period_end * 1000);
            
            await supabase
              .from('user_profiles')
              .update({
                isPremium: true,
                onboardingCompleted: true,
                subscriptionPlan: subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
                stripeSubscriptionId: session.subscription as string,
                stripeCustomerId: session.customer as string,
                nextDueDate: nextDueDate.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);
            
            console.log('Updated user profile for:', userId);
          }
        }
        
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', updatedSubscription.id);
        
        // Update subscription status in database
        const supabaseUrl2 = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey2 = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        if (supabaseUrl2 && supabaseServiceKey2) {
          const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
          const supabase = createClient(supabaseUrl2, supabaseServiceKey2);
          
          const nextDueDate = new Date(updatedSubscription.current_period_end * 1000);
          
          await supabase
            .from('user_profiles')
            .update({
              isPremium: updatedSubscription.status === 'active',
              subscriptionPlan: updatedSubscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
              nextDueDate: nextDueDate.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripeSubscriptionId', updatedSubscription.id);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        // Mark user as no longer premium
        const supabaseUrl3 = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey3 = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        if (supabaseUrl3 && supabaseServiceKey3) {
          const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
          const supabase = createClient(supabaseUrl3, supabaseServiceKey3);
          
          await supabase
            .from('user_profiles')
            .update({
              isPremium: false,
              subscriptionPlan: null,
              nextDueDate: null,
              updated_at: new Date().toISOString(),
            })
            .eq('stripeSubscriptionId', deletedSubscription.id);
        }
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
