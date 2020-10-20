import express, { Request, Response } from 'express';
import { requireAuth, BadRequestError, NotAuthorizedError } from '@logicanvas/common'
import { Order, OrderStatus } from '../models/order'

import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router();

// TODO: This should be a "PATCH" request instead of a delete since we are not deleting any record
router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
  const { orderId } = req.params

  const order = await Order.findById(orderId).populate('ticket')

  if (!order) {
    throw new BadRequestError('Order not found')
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError()
  }

  order.status = OrderStatus.Cancelled
  await order.save()

  // poublish an event to notify that this order was cancelled
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  })

  // TODO: status should be that of the patch request instead
  res.status(204).send(order);
})

export { router as deleteOrderRouter }