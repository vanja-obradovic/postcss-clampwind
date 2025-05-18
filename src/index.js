const clampwind = (opts = {}) => {
  return {
    postcssPlugin: 'clampwind',
    AtRule (atRule) {
       console.log(atRule)
    }
  }
}
clampwind.postcss = true
 
module.exports = clampwind