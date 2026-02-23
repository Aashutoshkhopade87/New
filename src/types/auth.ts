export type AuthStep = 'request-code' | 'verify-code';

export type PhoneAuthState = {
  countryCode: string;
  phoneNumber: string;
  verificationCode: string;
};

export type AuthMessage = {
  type: 'success' | 'error';
  text: string;
};
