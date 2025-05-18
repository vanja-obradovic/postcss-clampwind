# tailwindcss-fluid-variants

A plugin for Tailwind CSS to create fluid variants of any Tailwind CSS utility.


## Installation

Install the plugin from npm:

```sh
npm install -D tailwindcss-fluid-variants
```

Then add the plugin to your `tailwind.config.js` file:

```js
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('tailwindcss-fluid-variants'),
    // ...
  ],
}
```

## Usage

To start using the plugin, you simply need to prefix with a tilde `~` any screen variant you want to make fluid.

```html
<div class="~sm:text-2xl ~md:text-3xl"></div>
```

### To-do/Limitations

- Check `rem` values compatibility for size utilities, numeric values as line-height, border-radius, I think right now it works only if the value is the same unit as the viewport unit

- Does not work with `@apply`
- Add container queries support, use `~@md:text-[24px]` to target the `@md` container query
- Make it Tailwind v4 compatible, especially when setting `	--spacing: 1px;` in the config
- TODO: Generator function that checks if the one-letter variable is already used, eg min-height and max-height would both be m-h
- Make the slope function work with descending values, eg `~md:text-[24px] ~lg:text-[20px]`
- Make it possible to configure the amount of screens, now it uses default 5 (sm, md, lg, xl, 2xl) but if they were three (sm, md, lg) it outputs way less css
- It generates around 4kb of css for each fluid utility and you usually need at least 2 to interpolate between, so it can become a lot of css
- Using future css `if()` function would remove the need for class selectors, and make it more resilient, would make it work with `@apply` too

### Features/Done

- works with custom utilities but they need to have a `-` in the name, eg `~md:heading-2 ~lg:heading-3`
- Prevent generating fluid variants for non-size utilities, like `flex`, colors etc if mistakenly prefixed with `~`

## License and Credits

This project is licensed under the [Apache-2.0 license](https://apache.org/licenses/LICENSE-2.0).

Copyright © 2025 Daniele De Pietri.