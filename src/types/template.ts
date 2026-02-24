export type Template = {
  id: string;
  name: string;
  imageUrl: string;
};

export type UserProfile = {
  uid: string;
  phone: string | null;
  fullName?: string | null;
  templateId?: string;
};
