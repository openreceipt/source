/**
 * Replaces a file name suffixed with `.ejs` to a provided replacement, or `` by
 * default
 * @param fileName
 * @param replacement
 */
export default (fileName: string, replacement: string = ''): string => {
  return fileName.replace(/\.ejs$/g, replacement);
};
