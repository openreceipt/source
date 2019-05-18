export interface Merchant {
  country: string;
  currency: string;
  email: string;
  name: string;
  online: boolean;
  phone?: string;
  storeName?: string;
  storeAddress?: string;
  taxNumber?: string;
}
