const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addVariant, theme, e, matchUtilities, matchVariant }) {
  
  console.log('Hello World')

  matchUtilities(
    {
      'text': (value) => (
        console.log(value),
        {
          fontSize: value,
      }),
    }
  )
})
