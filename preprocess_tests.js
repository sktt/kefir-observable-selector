const babel = require('babel-core')

module.exports = {
  process(src, filename) {
    if (babel.util.canCompile(filename)) {
      return babel.transform(src, {
        auxiliaryCommentBefore: 'istanbul ignore next',
        filename,
        presets: ["es2015-node", "stage-0", "jest"],
        babelrc: false,
        retainLines: true,
      }).code;
    }
    return src;
  },
};
