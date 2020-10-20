import mongoose from 'mongoose'
import request from 'supertest';
import { app } from '../../app';
import { stripe } from '../../stripe'
import { Order, OrderStatus } from '../../models/order'
import { Payment } from '../../models/payment'

//jest.mock('../../stripe')

it('returns 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdasd',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404)
})

it('returns 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 200,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdasd',
      orderId: order.id
    })
    .expect(401)

})

it('returns 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    price: 200,
    status: OrderStatus.Cancelled
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'asdasd',
      orderId: order.id
    })
    .expect(400)

})

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100000)
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId,
    price,
    status: OrderStatus.Created
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201) 
    
    //expect(stripe.charges.create).toHaveBeenCalled()

    //const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
    //expect(chargeOptions.source).toEqual('tok_visa')
    //expect(chargeOptions.amount).toEqual(order.price * 100)
    //expect(chargeOptions.currency).toEqual('usd')

    const stripeCharges = stripe.charges.list({ limit: 50})
    const stripeCharge = (await stripeCharges).data.find(charge => {
      return charge.amount === price * 100
    })

    expect(stripeCharge).toBeDefined()
    expect(stripeCharge?.currency).toEqual('usd')

    const payment = await Payment.findOne({
      orderId: order.id,
      stripeId: stripeCharge?.id
    })

    expect(payment).not.toBeNull()
})


