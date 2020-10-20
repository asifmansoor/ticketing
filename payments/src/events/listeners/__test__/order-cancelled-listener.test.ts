import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent, OrderStatus } from '@logicanvas/common'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  // create and save a ticket
  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'sdfdsfsd',
    price: 200,
    status: OrderStatus.Created
  })
  await order.save()

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: 'dfzdsfsa',
    }
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }

}

it('cancels the order', async () => {
  // setup
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertions to make sure a ticket has the order id set
  const updatedOrder = await Order.findById(data.id)

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled)

})

it('acks the message', async () => {
  // setup
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // make sure ack was called
  expect(msg.ack).toHaveBeenCalled()
})