'use strict';
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');
const auth = require('../../auth-details');

const { sanitizeEntity } = require('strapi-utils');

const razorpay = new Razorpay({
  key_id: auth.key_id,
  key_secret: auth.key_secret,
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

  verifyOrder: async (ctx) => {
    let rz_payment_id = ctx.request.body['razorpay_payment_id'];
    let rz_order_id = ctx.request.body['razorpay_order_id'];
    let rz_signature = ctx.request.body['razorpay_signature'];

    // Calculate the checksum
    let generatedSignature = crypto.createHmac(
      "SHA256",
      auth.key_secret
    ).update(
      rz_order_id + "|" + rz_payment_id
    ).digest("hex");

    var isSignatureValid = generatedSignature == rz_signature;
    // Check if signature is valid
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
      let error = {
        error: true,
        message: "Payment verification failed. Please contact customer support."
      }
      return error;
    }
  }
};
