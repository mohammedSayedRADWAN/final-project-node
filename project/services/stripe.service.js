import Stripe from 'stripe';
import { ApiError } from '../utils/ApiError.js';
import { Order } from '../models/Order.js';
import Payment from '../models/PaymentModel.js';

class StripeService {
    // Lazy getter for Stripe to avoid initialization errors before dotenv loads
    static get stripeClient() {
        if (!process.env.STRIPE_SECRET_KEY) {
            return null;
        }
        return new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    /**
     * @description Create a Stripe Checkout Session
     */
    static async createCheckoutSession(orderId, userId) {
        const client = this.stripeClient;
        if (!client) throw new ApiError(500, "Stripe configuration missing");

        const order = await Order.findById(orderId);
        
        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (order.status !== "Pending") {
            throw new ApiError(400, "Only pending orders can be paid");
        }

        // 1. Prepare Line Items for Stripe
        const lineItems = order.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }));

        // Add Shipping Fee as a line item
        if (order.shipping > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Shipping Fee',
                    },
                    unit_amount: Math.round(order.shipping * 100),
                },
                quantity: 1,
            });
        }

        // 2. Create the Session
        const baseUrl = process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:8000";

        const session = await client.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            customer_email: order.isGuest ? order.guestEmail : undefined, // Use guest email if guest
            success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/payment/cancel`,
            metadata: {
                orderId: order._id.toString(),
                userId: userId ? userId.toString() : "guest",
            },
        });

        return session;
    }

    /**
     * @description Verify and handle Stripe Webhook
     */
    static async handleWebhook(signature, rawBody) {
        const client = this.stripeClient;
        if (!client) throw new ApiError(500, "Stripe configuration missing");

        let event;

        try {
            event = client.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            throw new ApiError(400, `Webhook Error: ${err.message}`);
        }

        // Handle the checkount.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata.orderId;
            const userId = session.metadata.userId;

            // Update Order Status
            await Order.findByIdAndUpdate(orderId, { status: "Paid" });

            // Create/Update Payment Record
            await Payment.create({
                userId,
                orderId,
                amount: session.amount_total / 100,
                paymentMethod: "card",
                status: "completed",
                transactionId: session.payment_intent
            });
        }

        return { received: true };
    }
}

export { StripeService };
