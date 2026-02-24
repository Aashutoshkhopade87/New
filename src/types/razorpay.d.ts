type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    contact?: string;
    name?: string;
  };
  handler: (response: { razorpay_payment_id: string }) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export {};
