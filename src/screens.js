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

/**
 * Format the breakpoints matches
 * @param {Array<string>} breakpointsMatches - Array of strings in format '--breakpoint-{name}: {value}'
 * @returns {Object} Object with breakpoint names as keys and values as values
 */
const formatRegexMatches = (matches) => {
  return matches.reduce((acc, match) => {
    const [, name, value] = match.match(/--breakpoint-([^:]+):\s*([^;]+)/);
    acc[name.trim()] = value.trim();
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
  formatRegexMatches,
  convertSortScreens
};
