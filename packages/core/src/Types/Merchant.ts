export interface Merchant {
  name: string;
  online: boolean;
  email: string;
  phone?: string;
  storeName?: string;
  storeAddress?: string;
  taxNumber?: string;
}
