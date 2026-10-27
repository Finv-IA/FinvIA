export const APP_NAME = 'FinvIA';
export const APP_TAGLINE = 'Cole o extrato. Mapeie seus ganhos.';

/** Código de acesso do painel Admin (fallback). Prefer role=admin no Base44. */
export const ADMIN_CODE = 'Admin2012';

/** Dados PIX (copia-e-cola e chave) */
export const PIX_KEY = 'guisouzaferreira02@gmail.com';
export const PIX_RECEIVER = 'GUILHERME S FERREIRA';
export const PIX_CITY = 'SAO PAULO';

/**
 * Planos de acesso
 * - lifetime: pagamento único
 * - monthly / annual: recorrente (cartão via Stripe Payment Link ou PIX + aprovação)
 *
 * stripePaymentLink: cole aqui o link gerado no Stripe Dashboard → Payment Links
 * (deixe vazio até configurar; o botão de cartão fica desabilitado).
 */
export const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Mensal',
    price: 9.99,
    interval: 'month',
    label: 'por mês',
    description: 'Cancele quando quiser. Ideal para testar.',
    highlight: false,
    stripePaymentLink: '', // ex: https://buy.stripe.com/xxxxx
  },
  annual: {
    id: 'annual',
    name: 'Anual',
    price: 96,
    interval: 'year',
    label: 'por ano',
    description: 'Equivale a R$ 8/mês. Economia de ~20%.',
    highlight: true,
    badge: 'Mais popular',
    stripePaymentLink: '',
  },
  lifetime: {
    id: 'lifetime',
    name: 'Vitalício',
    price: 200,
    interval: 'once',
    label: 'pagamento único',
    description: 'Pague uma vez e use para sempre.',
    highlight: false,
    badge: 'Melhor valor',
    stripePaymentLink: '',
  },
};

/** @deprecated use PLANS */
export const PRICE = PLANS.lifetime.price;
