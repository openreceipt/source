import Generator from 'yeoman-generator';

import replaceTemplatePrefix from './replaceTemplatePrefix';
import replaceTemplateSuffix from './replaceTemplateSuffix';

/**
 * Copies template files to a destination
 * @param gen
 * @param files
 */
export default (gen: Generator, files: string[]) => {

  const copyTemplate = (path: string) => {
    const replacedPath = replaceTemplateSuffix(replaceTemplatePrefix(path));

    gen.fs.copyTpl(
      gen.templatePath(path),
      gen.destinationPath(replacedPath),
      gen.options,
    );
  };

  files.forEach(copyTemplate);
};
