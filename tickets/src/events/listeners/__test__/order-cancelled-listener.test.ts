import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { OrderCancelledEvent, OrderStatus } from '@logicanvas/common'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/tickets'

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  // create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'Movie',
    price: 20,
    userId: 'sdfsdf',
  })
  ticket.set({ orderId })
  await ticket.save()

  // create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    }
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, orderId, data, msg }

}

it('cancels the ticket', async () => {
  // setup
  const { listener, ticket, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertions to make sure a ticket has the order id set
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket?.orderId).not.toBeDefined()

})

it('acks the message', async () => {
  // setup
  const { listener, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // make sure ack was called
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  // setup
  const { listener, ticket, orderId, data, msg } = await setup()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(ticketUpdatedData.orderId).not.toBeDefined()

})