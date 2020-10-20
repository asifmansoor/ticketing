import { Ticket } from '../tickets'

it('implements optimistic concurrency control', async (done) => {
  // Create the instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: 'sdfdfs'
  })

  // Save the ticket to the database
  await ticket.save()

  // fetch the ticket twice
  const fetchedTicketOne = await Ticket.findById(ticket.id)
  const fetchedTicketTwo = await Ticket.findById(ticket.id)

  // make two separate changes to the tickets we fetched
  fetchedTicketOne!.price = 30
  fetchedTicketTwo!.price = 40

  // save the first fetched ticket
  await fetchedTicketOne!.save()

  // save the second fetched ticket and expect an error

  // This does not work with typescript
  /*expect(async () => {
    await fetchedTicketTwo!.save()
  }).toThrow()*/

  try {
    await fetchedTicketTwo!.save()
  } catch (err) {
    return done();
  }

  throw new Error('Should not reach this point')
  
})

it('increments the version number on multiple saves', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: 'sdfdfs'
  })

  // Save the ticket
  await ticket.save()

  // Check the version number
  expect(ticket.version).toEqual(0)

  // Save again
  await ticket.save()

  // Check version again
  expect(ticket.version).toEqual(1)
})