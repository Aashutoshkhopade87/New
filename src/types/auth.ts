export type AuthStep = 'request-otp' | 'verify-otp';

export type AuthMode = 'login' | 'signup';

export type PhoneAuthState = {
  countryCode: string;
  phoneNumber: string;
  verificationCode: string;
  fullName: string;
  countrySearch: string;
};

export type AuthMessage = {
  type: 'success' | 'error';
  text: string;
};

export type CountryOption = {
  code: string;
  country: string;
  flag: string;
};
