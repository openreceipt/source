/**
 * Checks if a given number is between two other numbers
 * @param {number} x
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const between = (x: number, min: number, max: number) => {
  return (x - min) * (x - max) <= 0;
};

/**
 * Extracts a single occurrence of a string between a given `prefix` and
 * `suffix`
 * @param {string} text
 * @param {string} prefix
 * @param {string} suffix
 * @returns {string}
 */
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

/**
 * Extracts multiple occurrences of a string between a given `prefix` and
 * `suffix`
 * @param {string} text
 * @param {string} prefix
 * @param {string} suffix
 * @returns {string}
 */
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
