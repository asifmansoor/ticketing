import { Publisher, Subjects, TicketUpdatedEvent } from '@logicanvas/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}