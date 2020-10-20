import { Publisher, ExpirationCompleteEvent, Subjects } from '@logicanvas/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}