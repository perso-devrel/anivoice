import type { CardForm } from '../components/CheckoutModal';

// $1 per minute
export const CREDIT_PRICE_PER_MINUTE_USD = 1;

export const TIME_PACK_10_MIN_SECONDS = 600;
export const TIME_PACK_50_MIN_SECONDS = 3000;
export const TIME_PACK_100_MIN_SECONDS = 6000;

export const TIME_PACK_10_MIN_PRICE = 10;
export const TIME_PACK_50_MIN_PRICE = 50;
export const TIME_PACK_100_MIN_PRICE = 100;

export const FAKE_PAYMENT_DELAY_MS = 1500;

export const MOCK_CARD_DEFAULTS: CardForm = {
  number: '4242 4242 4242 4242',
  expiry: '12/28',
  cvc: '123',
};
