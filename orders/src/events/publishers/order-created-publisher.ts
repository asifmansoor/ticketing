import { Publisher, OrderCreatedEvent, Subjects } from '@logicanvas/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}