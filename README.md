# clampwind

A PostCSS plugin to create fluid clamp values for any Tailwind CSS utility.


## Installation

Install the plugin from npm:

```sh
npm install -D clampwind
```

### PostCSS setup

Add the plugin to your `postcss.config.js` file:

```js
// postcss.config.js
export default { 
  plugins: { 
    "@tailwindcss/postcss": {},
    "clampwind": {}
  } 
};

```

### Vite project

If you are using Vite, you are probably using tailwind with `@tailwindcss/vite`. 

Vite will automatically detect the `postcss.config.js` file and use the plugin, without the need to explicitly define it in `vite.config.js`. So you just need to have `postcss.config.js` in your root folder.

```js
// postcss.config.js
export default { 
  plugins: { 
    "clampwind": {}
  } 
};

```

## Usage

To use this plugin you need to use the `clamp()` function but only with **two arguments,** the first one is the minimum value and the second one is the maximum value.

### Clamp between smallest and largest breakpoint

Write the tailwind utility you want to make fluid, without any breakpoint modifier, for example:

```html
<div class="text-[clamp(16px,50px)]"></div>
```

This will use Tailwind default largest and smallest breakpoint.

```css
.text-\[clamp\(16px\,50px\)\] {
  @media (width >= 40rem) { /* 640px */
    @media (width < 96rem) { /* 1536px */
      font-size: clamp(1rem, ... , 3.125rem);
    }
  }
}
```

But clampwind also generates automatically the css values for any screen size outside of the range of the smallest and largest breakpoints. The full generated css will be:

```css
.text-\[clamp\(16px\,50px\)\] {
  font-size: clamp(1rem, ... , 3.125rem);
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
      font-size: clamp(1rem, ... , 3.125rem);
    }
  }
}
```

### Clamp from one breakpoint

If you want to define a clamp value from a single breakpoint, clampwind will automatically generate the css for the upper breakpoint, or the lower breakpoint if you use the `max-` modifier, for example:

```html
<div class="md:text-[clamp(16px,50px)]"></div>
```

This will generate the following css:

### Add custom breakpoints

Tailwind v4 introduced the new configuration via CSS custom properties, but Tailwind by default, will not output in your CSS any custom properties that are not referenced in your CSS, to solve this issue you should use the `@theme static` directive instead of `@theme` to create custom breakpoints.

```css
@theme static {
  --breakpoint-4xl: 1600px;
}
```

### Clamp between custom breakpoints

With Tailwind v4 it's really easy to use one-time custom breakpoints, and this plugin will automatically detect them and use them to clamp the CSS property.

```html
<div class="min-[1000px]:max-xl:text-[clamp(16px,50px)]"></div>
```

This will generate the following css:

```css
.min-\[1000px\]\:max-xl\:text-\[clamp\(16px\,50px\)\] {
  @media (width >= 1000px) { /* 1000px */
    @media (width < 64rem) { /* 1600px */
      font-size: clamp(1rem, ... , 3.125rem);
    }
  }
}
```

### Clamp between Tailwind scale values

A quick way to define two clamped values is to use the Tailwind scale values, for example:

```html
<div class="text-[clamp(16,50)]"></div>
```

The bare values size depends on the theme `--spacing` size, so if you have have it set to `1px` it will generate the following css:

```css
.text-\[clamp\(16\,50\)\] {
  @media (width >= 40rem) { /* 640px */
    @media (width < 96rem) { /* 1536px */
      font-size: clamp(1rem, ... , 3.125rem);
    }
  }
}
```

### Clamp custom properties values

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

## License and Credits

This project is licensed under the [Apache-2.0 license](https://apache.org/licenses/LICENSE-2.0).

Copyright © 2025 Daniele De Pietri.