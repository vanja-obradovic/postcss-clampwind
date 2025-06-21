# clampwind

A plugin for Tailwind CSS to create fluid variants of any Tailwind CSS utility.


## Installation

Install the plugin from npm:

```sh
npm install -D clampwind
```

Then add the plugin to your `tailwind.config.js` file:

```js
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('clampwind'),
    // ...
  ],
}
```

## Usage

To use this plugin you need to use the `clamp()` function but only with two arguments, the first one is the minimum value and the second one is the maximum value.

### Clamp between smallest and largest breakpoint

Write the tailwind utility you want to make fluid, without any breakpoint modifier, for example:

```html
<div class="text-[clamp(16px,50px)]"></div>
```

This will use Tailwind default largest and smallest breakpoint, or any other breakpoint you have defined, and generate the following css:

```css
.text-\[clamp\(16px\,50px\)\] {
  @media (width >= 40rem) { /* 640px */
    @media (width < 96rem) { /* 1536px */
      font-size: clamp(16px, ... , 50px);
    }
  }
}
```
### Clamp between two breakpoints

Simply add regular Tailwind breakpoint modifiers to the utility, for example:

```html
<div class="md:max-lg:text-[clamp(16px,50px)]"></div>
```

To clamp the CSS property between the two breakpoints you need to use the `max-` modifier, in this case the CSS property will be clamped between the `md` and `lg` breakpoints.

This will generate the following css:

```css
.md\:max-lg\:text-\[clamp\(16px\,50px\)\] {
  @media (width >= 48rem) { /* 768px */
    @media (width < 64rem) { /* 1024px */
      font-size: clamp(16px, ... , 50px);
    }
  }
}
```

### Add custom breakpoints

Tailwind v4 introduced the new configuration via CSS custom properties, but Tailwind will not output in your CSS any custom properties that's not referenced in your CSS, to solve this issue you should use the `@theme static` directive to create custom breakpoints.

```css
@theme static {
  --breakpoint-4xl: 1600px;
}
```

### Clamp between custom values

With Tailwind v4 it's really easy to use one-time custom breakpoints, and this plugin will automatically detect them and use them to clamp the CSS property.

```html
<div class="min-[1000px]:max-xl:text-[clamp(16px,50px)]"></div>
```

This will generate the following css:

```css
.min-\[1000px\]\:max-xl\:text-\[clamp\(16px\,50px\)\] {
  @media (width >= 1000px) { /* 1000px */
    @media (width < 64rem) { /* 1600px */
      font-size: clamp(16px, ... , 50px);
    }
  }
}
```

### Clamp between custom properties

You can also use custom properties in your clamped values, for example like this:

```html
<div class="text-[clamp(--text-sm,50px)]"></div>
```
or like this:

```html
<div class="text-[clamp(var(--text-sm),50px)]"></div>
```

## Features

- Use interchangeably px and rem values in the clamped values
- Use Tailwind custom properties in the clamped values
- Omit units, it will use the theme --spacing size
- Support container queries
- support decreasing and negative values ranges
- Error messages outputted as css comments


## TODO
- Check if the pxToRem plugin does conversions before the plugin runs
- Check if it works well with vite

## License and Credits

This project is licensed under the [Apache-2.0 license](https://apache.org/licenses/LICENSE-2.0).

Copyright © 2025 Daniele De Pietri.