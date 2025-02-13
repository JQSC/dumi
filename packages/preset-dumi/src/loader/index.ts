import transformer from '../transformer';
import getTheme from '../theme/loader';
import { getFileRangeLines, getFileContentByRegExp } from '../utils/getFileContent';

export default async function loader(raw: string) {
  let content = raw;
  const params = new URLSearchParams(this.resourceQuery);
  const range = params.get('range');
  const regexp = params.get('regexp');

  // extract content of markdown file
  if (range) {
    content = getFileRangeLines(content, range);
  } else if (regexp) {
    content = getFileContentByRegExp(content, regexp, this.resourcePath);
  }

  const result = transformer.markdown(content, this.resourcePath, { noCache: content !== raw });
  const theme = await getTheme();

  return `
    import React from 'react';
    import { dynamic } from 'dumi';
    import { Link, AnchorLink } from 'dumi/theme';
    ${theme.builtins
      .concat(theme.fallbacks)
      .map(component => `import ${component.identifier} from '${component.source}';`)
      .join('\n')}
    import DUMI_ALL_DEMOS from '@@/dumi/demos';

    ${(result.meta.demos || []).join('\n')}

    export default function () {
      return (
        <>
          ${
            result.meta.translateHelp
              ? result.meta.translateHelp === true
                ? `<Alert>This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.</Alert>`
                : `<Alert>${result.meta.translateHelp}</Alert>`
              : ''
          }
          ${result.content}
        </>
      );
  }`;
}
