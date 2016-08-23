import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import nodeResolve from 'rollup-plugin-node-resolve'

const PROD = process.env.NODE_ENV === 'production'
const MINIFY = PROD

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'KefirObservableSelector',
  globals: {
    'kefir': 'Kefir'
  },
  plugins: [babel({
    exclude: 'node_modules/**',
    runtimeHelpers: true
  }), nodeResolve({
    jsnext: true,
    main: true,
    skip: ['kefir']
  })].concat(
    MINIFY ? [uglify()] : []
  ),
  dest: `dist/index${MINIFY ? '.min' : '' }.js`
}
