import { Publisher, Subjects, TicketCreatedEvent } from '@logicanvas/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}