/**
 * Default screen breakpoints 
 * defined by the PostCSS plugin
 */
const defaultScreens = {
  sm: '40rem',  // 640px
  md: '48rem',  // 768px
  lg: '64rem',  // 1024px
  xl: '80rem',  // 1280px
  '2xl': '96rem' // 1536px
};

const defaultContainerScreens = {
  '@3xs': '16rem',  // 256px
  '@2xs': '18rem',  // 288px
  '@xs': '20rem',  // 320px
  '@sm': '24rem',  // 384px
  '@md': '28rem',  // 448px
  '@lg': '32rem',  // 512px
  '@xl': '36rem',  // 576px
  '@2xl': '42rem',  // 672px
  '@3xl': '48rem',  // 768px
  '@4xl': '56rem',  // 896px
  '@5xl': '64rem',  // 1024px
  '@6xl': '72rem',  // 1152px
  '@7xl': '80rem'  // 1280px
};

/**
 * Format the breakpoints matches
 * @param {Array<string>} breakpointsMatches - Array of strings in format '--breakpoint-{name}: {value}'
 * @returns {Object} Object with breakpoint names as keys and values as values
 */
const formatBreakpointsRegexMatches = (matches) => {
  return matches.reduce((acc, match) => {
    const [, name, value] = match.match(/--breakpoint-([^:]+):\s*([^;]+)/);
    acc[name.trim()] = value.trim();
    return acc;
  }, {});
};

/**
 * Format the container breakpoints matches
 * @param {Array<string>} breakpointsMatches - Array of strings in format '--container-{name}: {value}'
 * @returns {Object} Object with container breakpoint names as keys and values as values
 */
const formatContainerBreakpointsRegexMatches = (matches) => {
  return matches.reduce((acc, match) => {
    const [, name, value] = match.match(/--container-([^:]+):\s*([^;]+)/);
    acc[`@${name.trim()}`] = value.trim();
    return acc;
  }, {});
};

/**
 * Convert and sort the screens
 * @param {Object} screens - The base screens object
 * @param {number} rootFontSize - The root font size
 * @returns {Object} The sorted screens
 */
const convertSortScreens = (screens, rootFontSize = 16) => {
  // First convert all values to rem
  const convertedScreens = Object.entries(screens).reduce((acc, [key, value]) => {
    // If value is in px, convert to rem
    if (value.includes('px')) {
      const pxValue = parseFloat(value);
      acc[key] = `${pxValue / rootFontSize}rem`;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Then sort by rem values
  const sortedKeys = Object.keys(convertedScreens).sort((a, b) => {
    const aValue = parseFloat(convertedScreens[a]);
    const bValue = parseFloat(convertedScreens[b]);
    return aValue - bValue;
  });

  // Create new object with sorted keys
  return sortedKeys.reduce((acc, key) => {
    acc[key] = convertedScreens[key];
    return acc;
  }, {});
};

export {
  defaultScreens,
  defaultContainerScreens,
  formatBreakpointsRegexMatches,
  formatContainerBreakpointsRegexMatches,
  convertSortScreens
};
