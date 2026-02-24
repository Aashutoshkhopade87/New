import { appEnv } from './env';

type RazorpayResponse = {
  razorpay_payment_id: string;
};

type OpenCheckoutInput = {
  amountInPaise: number;
  name: string;
  description: string;
  prefill?: {
    contact?: string;
    name?: string;
  };
};

function ensureRazorpayScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(input: OpenCheckoutInput): Promise<RazorpayResponse> {
  const razorpayKeyId = appEnv.razorpayKeyId;
  if (!razorpayKeyId) {
    throw new Error('Missing VITE_RAZORPAY_KEY_ID in environment.');
  }

  await ensureRazorpayScript();

  return new Promise((resolve, reject) => {
    const instance = new window.Razorpay({
      key: razorpayKeyId,
      amount: input.amountInPaise,
      currency: 'INR',
      name: input.name,
      description: input.description,
      prefill: input.prefill,
      handler: (response: RazorpayResponse) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled.')),
      },
    });

    instance.open();
  });
}
