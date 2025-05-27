import Stripe from "stripe";

class StripeManager {
  private _stripe: Stripe | null = null;

  // Lazy initialization of Stripe
  get stripe(): Stripe {
    if (!this._stripe) {
      const apiKey = process.env.STRIPE_SECRET_KEY;
      if (!apiKey) {
        console.error(
          "STRIPE_SECRET_KEY is not defined in environment variables"
        );
        throw new Error("Stripe API key is not defined");
      }

      this._stripe = new Stripe(apiKey);
    }
    return this._stripe;
  }

  // Create a payment intent
  async createPaymentIntent(
    amount: number,
    currency: string = "usd",
    metadata: any = {}
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // Amount in cents
        currency,
        metadata,
        payment_method_types: ["card"],
      });
      return { success: true, data: paymentIntent };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Confirm a payment intent
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );
      return { success: true, data: paymentIntent };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Create a Stripe customer
  async createCustomer(email: string, name: string, phone?: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        phone,
      });
      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Handle webhook events
  async handleWebhookEvent(payload: any, signature: string) {
    try {
      // Check if we have the webhook secret
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn(
          "STRIPE_WEBHOOK_SECRET is not defined in environment variables"
        );

        // For development, if we don't have a webhook secret but have a valid payload with type,
        // we can still process it for testing purposes
        if (
          process.env.NODE_ENV !== "production" &&
          payload.type &&
          payload.data
        ) {
          console.log("Development mode: Using raw event object for testing");
          return { success: true, data: payload };
        }

        return {
          success: false,
          error: "Webhook secret is not configured",
        };
      }

      // Verify the event with Stripe
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return { success: true, data: event };
    } catch (error: any) {
      console.error(`Webhook verification error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Create a Checkout Session for guest checkout
  async createCheckoutSession({
    orderItems,
    orderId,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
  }: {
    orderItems: Array<{
      productId: string;
      name: string;
      description?: string;
      amount: number; // in cents
      quantity: number;
      images?: string[];
    }>;
    orderId: string;
    customerEmail?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    try {
      // Create line items for Checkout
      const lineItems = orderItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images,
            metadata: {
              productId: item.productId,
            },
          },
          unit_amount: Math.round(item.amount * 100), // in cents
        },
        quantity: item.quantity,
      }));

      // Create the Checkout Session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        metadata: {
          orderId,
          ...(metadata || {}),
        },
      });

      return { success: true, data: session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default new StripeManager();
