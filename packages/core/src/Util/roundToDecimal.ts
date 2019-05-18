const roundToDecimal = (num: number, decimalPlaces: number) => {
  let zeros = (1.0).toFixed(decimalPlaces);
  zeros = zeros.substr(2);
  const mulDiv = parseInt('1' + zeros, 10);
  const increment = parseFloat('.' + zeros + '01');
  if ((num * (mulDiv * 10)) % 10 >= 5) {
    num += increment;
  }
  return Math.round(num * mulDiv) / mulDiv;
};

export default roundToDecimal;
