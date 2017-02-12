// Rolup plugins
import babel        from 'rollup-plugin-babel';
import eslint       from 'rollup-plugin-eslint'
import resolve      from 'rollup-plugin-node-resolve';
import commonjs     from 'rollup-plugin-commonjs';
import replace      from 'rollup-plugin-replace';
import uglify       from 'rollup-plugin-uglify';

// Postcss
import postcss      from 'rollup-plugin-postcss';

// Postcss plugins
import simplevars   from 'postcss-simple-vars';
import nested       from 'postcss-nested';
import cssnext      from 'postcss-cssnext';
import cssnano      from 'cssnano';

export default {
  entry: 'src/js/main.js',
  dest: 'src/build/bundle.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    postcss({
      extentions: ['.css'],
      plugins: [
        simplevars(),
        nested(),
        cssnext({warnForDuplicates: false}),
        cssnano()
      ]
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    eslint({
      exclude: 'src/css/**'
    }),
    (process.env.NODE_ENV === 'production' &&
      babel({
        exclude: 'node_modules/** '
      })
    ),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (process.env.NODE_ENV === 'production' && uglify()),
  ]
}