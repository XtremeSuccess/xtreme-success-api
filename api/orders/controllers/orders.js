'use strict';
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: 'rzp_test_FFexwWi4LsHnuc',
  key_secret: 'XClkyWqV3uVqHBWrYjfc557R',
});
/**
 * A set of functions called "actions" for `orders`
 */

module.exports = {
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }

  getOrder: async (ctx) => {
    let amount = ctx.request.body.amount;
    let currency = 'INR';
    const payment_capture = 1;

    const options = {
      amount: (amount * 100),
      currency,
      receipt: shortid.generate(),
      payment_capture
    }
    const response = await razorpay.orders.create(options);
    const res = { ...response }
    res.user = ctx.state.user.id;
    console.log(res);
    const order = {
      order_id: res.id,
      amount: res.amount,
      amount_paid: res.amount_paid,
      amount_due: res.amount_due,
      currency: res.currency,
      receipt: res.receipt,
      offer_id: res.offer_id,
      status: res.status,
      attempts: res.attempts,
      created_at: res.created_at,
      user: res.user
    }
    let entity = await strapi.services['orders'].create(order);
    ctx.send(res);
  },

  verifyOrder: async (ctx) => {
    // order_Et0zePcXRoysda

    let payment_id = ctx.request.body.razorpay_payment_id;
    let order_id = ctx.request.body.razorpay_order_id;
    let signature = ctx.request.body.razorpay_signature;

    let generatedSignature = crypto.createHmac(
      "SHA256",
      'XClkyWqV3uVqHBWrYjfc557R'
    ).update(
      razorpay_order_id + "|" + razorpay_payment_id
    ).digest("hex");

    var isSignatureValid = generatedSignature == signature;
    if (isSignatureValid) {
      //TODO: Send order details here
      let order = await strapi.services['orders'].findOne({
        'order_id': razorpay_order_id
      });
      // fetch new details from rzorpay and update the record here

    } else {
      //TODO: Send error code here
    }
  }
};
