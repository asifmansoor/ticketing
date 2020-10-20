import { Publisher, OrderCancelledEvent, Subjects } from '@logicanvas/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}