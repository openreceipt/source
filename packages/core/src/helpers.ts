export const roundToDecimal = (num: number, decimalPlaces: number) => {
  let zeros = (1.0).toFixed(decimalPlaces);
  zeros = zeros.substr(2);
  const mulDiv = parseInt('1' + zeros, 10);
  const increment = parseFloat('.' + zeros + '01');
  if ((num * (mulDiv * 10)) % 10 >= 5) {
    num += increment;
  }
  return Math.round(num * mulDiv) / mulDiv;
};

export const extract = (text: string, prefix: string, suffix: string) => {
  let str = text;
  const startIndex = str.indexOf(prefix);

  if (startIndex >= 0) {
    str = str.substring(startIndex + prefix.length);
  } else {
    return '';
  }

  if (suffix) {
    const endIndex = str.indexOf(suffix);
    if (endIndex >= 0) {
      str = str.substring(0, endIndex);
    } else {
      return '';
    }
  }

  return str;
};

export const extractAll = (text: string, prefix: string, suffix: string) => {
  const innerExtract = (
    innerText: string,
    startIndex: number,
    innerSuffix: string,
  ) => {
    const endIndex = text.indexOf(innerSuffix, startIndex);
    if (endIndex >= 0) {
      return text.substring(startIndex, endIndex);
    }

    return '';
  };

  let possibleOccurences = [];
  const regex = new RegExp(prefix, 'g');
  while (regex.exec(text)) {
    possibleOccurences.push(regex.lastIndex);
  }

  return possibleOccurences.map((prefixIndex) => {
    return innerExtract(text, prefixIndex, suffix);
  });
};

export const between = (x: number, min: number, max: number) => {
  return (x - min) * (x - max) <= 0;
};
