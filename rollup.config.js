import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import nodeResolve from 'rollup-plugin-node-resolve'

const PROD = process.env.NODE_ENV === 'production'
const MINIFY = PROD

export default {
  format: 'umd',
  moduleName: 'kefirSelector',
  globals: {
    'kefir': 'Kefir'
  },
  plugins: [babel(), nodeResolve({
    jsnext: true,
    main: true,
    skip: ['kefir']
  })].concat(
    MINIFY ? [uglify()] : []
  ),
  dest: `dist/index${MINIFY ? '.min' : '' }.js`
}
