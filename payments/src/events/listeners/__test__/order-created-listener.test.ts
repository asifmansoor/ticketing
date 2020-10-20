import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent, OrderStatus } from '@logicanvas/common'
import { OrderCreatedListener } from '../order-created-listener'
import { natsWrapper } from '../../../nats-wrapper'

import { Order } from '../../../models/order'

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    expiresAt: 'hgfhgfh',
    userId: 'fhgfhf',
    ticket: {
      id: 'hjgfhjg',
      price: 200
    }
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }

}

it('replicates the order info', async () => {
  // setup
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertions to make sure a ticket has the order id set
  const order = await Order.findById(data.id)

  expect(order!.id).toEqual(data.id)

})

it('acks the message', async () => {
  // setup
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // make sure ack was called
  expect(msg.ack).toHaveBeenCalled()
})