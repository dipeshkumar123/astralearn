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

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!course) return res.status(404).json({ error: 'Course not found' });
        if (Number(course.price || 0) <= 0) {
            return res.status(400).json({ error: 'Checkout is only required for paid courses' });
        }

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
                    unit_amount: Math.round(course.price * 100),
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

// Webhook handler
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;

        if (userId && courseId) {
            try {
                await prisma.purchase.upsert({
                    where: {
                        userId_courseId: { userId, courseId }
                    },
                    update: {},
                    create: { userId, courseId }
                });

                await prisma.enrollment.upsert({
                    where: {
                        userId_courseId: { userId, courseId }
                    },
                    update: {},
                    create: { userId, courseId }
                });
            } catch (dbError) {
                console.error('[STRIPE_WEBHOOK_DB_ERROR]', dbError);
                return res.status(500).json({ error: 'Failed to process payment record' });
            }
        }
    }

    res.status(200).send();
});

module.exports = router;
