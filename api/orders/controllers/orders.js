'use strict';
const Razorpay = require('razorpay');
const shortid = require('shortid');

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
    ctx.send(res);
  }
};
