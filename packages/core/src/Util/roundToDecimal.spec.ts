import roundToDecimal from './roundToDecimal';

describe('roundToDecimal', () => {
  it('rounds decimal numbers to the required precision', () => {
    const result = roundToDecimal(2.009, 2);

    expect(result).toEqual(2.01);
  });
});
