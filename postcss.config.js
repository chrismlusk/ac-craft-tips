const path = require('path');
const postcss = require('postcss');

function getPlugins() {
  const plugins = [
    {
      postcssPlugin: 'grouped',
      Once(root, { result }) {
        return postcss([
          require('postcss-import'),
          require('postcss-mixins')({
            mixinsFiles: path.join(__dirname, './src/styles/_mixins.css'),
          }),
        ]).process(root, result.opts);
      },
    },
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(require('cssnano'));
  }

  return plugins;
}

module.exports = {
  plugins: getPlugins(),
};
