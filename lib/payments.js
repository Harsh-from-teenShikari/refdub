import { stripe } from '@/utils/stripe';

export const createSubscription = async ({
  customer,
  price,
  quantity = 1,
  metadata = {},
  success_url,
  cancel_url,
  payment_method_types = ['card'],
  billing_address_collection = 'required',
  allow_promotion_codes = true,
  trial_from_plan = true
}) => {
  return stripe.checkout.sessions.create({
    payment_method_types,
    billing_address_collection,
    customer,
    line_items: [
      {
        price,
        quantity
      }
    ],
    mode: 'subscription',
    allow_promotion_codes,
    subscription_data: {
      trial_from_plan,
      metadata
    },
    success_url,
    cancel_url
  });
};

export const constructWebhookEvent = (buf, sig, secret) => {
  return stripe.webhooks.constructEvent(buf, sig, secret);
};

export const retrieveAccount = async (accountId) => {
  return stripe.accounts.retrieve({
    stripeAccount: accountId
  });
};

export const createPortalSession = async (params) => {
  return stripe.billingPortal.sessions.create(params);
};

export const getOAuthToken = async (params) => {
  return stripe.oauth.token(params);
};

export const createCustomer = async (params) => {
  return stripe.customers.create(params);
};

export const updateCustomer = async (customerId, params, options) => {
  return stripe.customers.update(customerId, params, options);
};

export const retrieveSubscription = async (subscriptionId, options) => {
  return stripe.subscriptions.retrieve(subscriptionId, options);
};

export const listCustomers = async (query, options) => {
  return stripe.customers.list(query, options);
};

export const listPaymentIntents = async (query, options) => {
  return stripe.paymentIntents.list(query, options);
};

export const retrieveInvoice = async (invoiceId, options) => {
  return stripe.invoices.retrieve(invoiceId, options);
};

export const listRefunds = async (query, options) => {
  return stripe.refunds.list(query, options);
};

export const updatePaymentIntent = async (paymentIntentId, params, options) => {
  return stripe.paymentIntents.update(paymentIntentId, params, options);
};

export const updateInvoice = async (invoiceId, params, options) => {
  return stripe.invoices.update(invoiceId, params, options);
};
