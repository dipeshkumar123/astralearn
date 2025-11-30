const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const Stripe = require('stripe');

// Initialize Stripe with secret key from env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// POST create checkout session
router.post('/checkout', requireAuth(), async (req, res) => {
    try {
        const { courseId } = req.body;
        const { userId } = req.auth();

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Check if already purchased
        const purchase = await prisma.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: course.id
                }
            }
        });

        if (purchase) {
            return res.status(400).json({ error: 'Already purchased' });
        }

        const line_items = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: course.title,
                        description: course.description ? course.description.substring(0, 100) : undefined,
                        images: course.thumbnail ? [course.thumbnail] : undefined,
                    },
                    unit_amount: Math.round(course.price * 100), // Amount in cents
                },
                quantity: 1,
            }
        ];

        let stripeCustomer = await prisma.user.findUnique({
            where: { id: user.id },
            select: { stripeCustomerId: true }
        });

        if (!stripeCustomer?.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
            });

            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customer.id }
            });
            stripeCustomer = { stripeCustomerId: customer.id };
        }

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomer.stripeCustomerId,
            line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/courses/${course.id}?success=1`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/courses/${course.id}?canceled=1`,
            metadata: {
                courseId: course.id,
                userId: user.id,
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('[STRIPE_ERROR]', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});

// Webhook handler (needs to be raw body in real app, simplified here)
// For local dev without webhook forwarding, we might need a manual "verify" endpoint or just rely on the success URL to trigger a check (less secure but works for MVP)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const courseId = session.metadata.courseId;

        if (userId && courseId) {
            await prisma.purchase.create({
                data: {
                    userId,
                    courseId,
                }
            });

            // Also create enrollment
            await prisma.enrollment.create({
                data: {
                    userId,
                    courseId
                }
            });
        }
    }

    res.status(200).send();
});

module.exports = router;
