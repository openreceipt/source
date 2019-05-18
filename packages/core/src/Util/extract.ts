const extract = (text: string, prefix: string, suffix: string) => {
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

export default extract;
