'use strict';
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');
const { sanitizeEntity } = require('strapi-utils');

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
    res.course = ctx.request.body.course;
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
      user: res.user,
      course: res.course
    }
    let entity = await strapi.services['orders'].create(order);
    return sanitizeEntity(entity, { model: strapi.models['orders'] });
  },

  //TODO: Move the whole thing to webhook when website is done
  verifyOrder: async (ctx) => {
    // order_Et0zePcXRoysda
    console.log(ctx.request.body);
    let rz_payment_id = ctx.request.body['razorpay_payment_id'];
    let rz_order_id = ctx.request.body['razorpay_order_id'];
    let rz_signature = ctx.request.body['razorpay_signature'];

    let generatedSignature = crypto.createHmac(
      "SHA256",
      'XClkyWqV3uVqHBWrYjfc557R'
    ).update(
      rz_order_id + "|" + rz_payment_id
    ).digest("hex");

    var isSignatureValid = generatedSignature == rz_signature;
    if (isSignatureValid) {
      console.log('Verified');
      console.log(rz_order_id);
      let { id, order_id } = await strapi.services['orders'].findOne({
        'order_id': rz_order_id
      });

      // Get the updated order
      let res = await razorpay.orders.fetch(order_id);

      // Create the updated order entry
      const rzOrderUpdated = {
        amount: res.amount,
        amount_paid: res.amount_paid,
        amount_due: res.amount_due,
        currency: res.currency,
        receipt: res.receipt,
        offer_id: res.offer_id,
        status: res.status,
        attempts: res.attempts,
      }
      // Update the DB and return
      let entity = await strapi.services['orders'].update({ id }, rzOrderUpdated);
      return sanitizeEntity(entity, { model: strapi.models['orders'] });
    } else {
      /* Remove this code from here and paste it in true */
      //TODO: Send error code here
    }
  }
};
