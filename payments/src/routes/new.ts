import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { stripe } from '../stripe'
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@logicanvas/common';
import { natsWrapper } from '../nats-wrapper';
import { Order } from '../models/order'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'


const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token is required'),
    body('orderId').notEmpty().withMessage('OrderId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser?.id) {
      //throw new BadRequestError('The use is trying to pay for a order he didnt place')
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order has already been cancelled')
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
      description: 'charge for order on ticketing app'
    })

    const payment = Payment.build({
      orderId,
      stripeId: charge.id
    })
    await payment.save()

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    })

    res.status(201).send({ id: payment.id })

  }
);

export { router as createChargeRouter };
