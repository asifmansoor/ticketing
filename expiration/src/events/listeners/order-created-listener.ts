import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@logicanvas/common'

import { queueGroupName } from './queue-group-name'
import { expirationQueue } from '../../queues/expiration-queue'


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated

  queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - Date.now()
    console.log('Waiting to process the job (in milliseconds): ', delay)
    console.log('Waiting to process the job (in seconds): ', delay/1000)
    console.log('Waiting to process the job (in minutes): ', delay/60000)

    await expirationQueue.add({
      orderId: data.id
    }, {
      delay
    })

    // ack the message
    msg.ack()

  }
}