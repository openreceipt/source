import { getAmountFromPriceString } from './';

describe('Currency', () => {
  describe('#getAmountFromPriceString', () => {
    it('handles extraneous whitespace', () => {
      const result = getAmountFromPriceString('GBP', '          £  9.99');

      expect(result).toEqual(999);
    });

    it('handles negative values correctly', () => {
      const result = getAmountFromPriceString('GBP', '-£9.99');

      expect(result).toEqual(-999);
    });

    it('formats GBP currency values correctly', () => {
      const result = getAmountFromPriceString('GBP', '£10.00');

      expect(result).toEqual(1000);
    });

    it('formats USD currency values correctly', () => {
      const result = getAmountFromPriceString('USD', '$10.99');

      expect(result).toEqual(1099);
    });
  });
});
