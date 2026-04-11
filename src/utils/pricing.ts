import type { CardForm } from '../components/CheckoutModal';

export const FREE_PLAN_CREDITS = 360000;
export const BASIC_PLAN_CREDITS = 1080000;
export const PRO_PLAN_CREDITS = 3600000;

export const TIME_PACK_10_MIN_SECONDS = 600;
export const TIME_PACK_50_MIN_SECONDS = 3000;
export const TIME_PACK_100_MIN_SECONDS = 6000;

export const TIME_PACK_10_MIN_PRICE = 12;
export const TIME_PACK_50_MIN_PRICE = 50;
export const TIME_PACK_100_MIN_PRICE = 90;

export const FAKE_PAYMENT_DELAY_MS = 1500;

export const MOCK_CARD_DEFAULTS: CardForm = {
  number: '4242 4242 4242 4242',
  expiry: '12/28',
  cvc: '123',
};
