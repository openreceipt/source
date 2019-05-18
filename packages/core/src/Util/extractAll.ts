const extractAll = (text: string, prefix: string, suffix: string) => {
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

export default extractAll;
