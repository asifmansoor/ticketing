import { Publisher, PaymentCreatedEvent, Subjects } from '@logicanvas/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}