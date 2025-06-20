/**
 * Extract two clamp args from a string
 * @param {string} value - The value to extract the clamp args from
 * @returns {Array<string>} The lower and upper clamp args
 */
const extractTwoValidClampArgs = (value) => {
  const m = value.match(/\bclamp\s*\(\s*(var\([^()]+\)|[^,()]+)\s*,\s*(var\([^()]+\)|[^,()]+)\s*\)$/);
  return m ? [m[1].trim(), m[2].trim()] : null;
};

/**
 * Extract the unit from a value
 * @param {string} value - The value to extract the unit from
 * @returns {string|null} The unit or null if no unit found
 */
const extractUnit = (value) => {
  const match = value.match(/\D+$/);
  return match ? match[0] : null;
};

/**
 * Format a property value
 * @param {string} value - The value to format
 * @returns {string} The formatted value
 */
const formatProperty = (value) => {
  const trimmedValue = value.replace(/\s+/g, '');
  return trimmedValue.replace(/var\(([^,)]+)[^)]*\)/, '$1');
};

/**
 * Convert a value to rem if px or has unit, otherwise return value
 * If the value is a custom property, it will be converted to the value of the custom property
 * @param {string} value - The value to convert to rem
 * @param {number} rootFontSize - The root font size
 * @param {number} spacingSize - The spacing size
 * @param {Object} customProperties - The custom properties
 * @returns {string} The converted value
 */
const convertToRem = (value, rootFontSize, spacingSize, customProperties = {}) => {
  const unit = extractUnit(value);
  const formattedProperty = formatProperty(value);

  if (!unit) {
    return `${value * spacingSize}rem`;
  }
  if (customProperties[formattedProperty]) {
    return `${customProperties[formattedProperty]}rem`;
  }

  if (unit === "px") {
    return `${value.replace("px", "") / rootFontSize}rem`;
  }

  if (unit === "rem") {
    return value;
  }

  return null;
};

/**
 * Generate a clamp function
 * @param {string} lower - The lower clamp arg
 * @param {string} upper - The upper clamp arg
 * @param {string} minScreen - The minimum screen size
 * @param {string} maxScreen - The maximum screen size
 * @param {number} rootFontSize - The root font size
 * @param {number} spacingSize - The spacing size
 * @param {boolean} containerQuery - Whether to use container queries
 * @returns {string} The generated clamp function,
 */
const generateClamp = (
  lower,
  upper,
  minScreen,
  maxScreen,
  rootFontSize = 16,
  spacingSize = 0.25,
  containerQuery = false
) => {
  const maxScreenInt = parseFloat(
    convertToRem(maxScreen, rootFontSize, spacingSize)
  );
  const minScreenInt = parseFloat(
    convertToRem(minScreen, rootFontSize, spacingSize)
  );

  const lowerInt = parseFloat(lower);
  const upperInt = parseFloat(upper);

  const isDescending = lowerInt > upperInt;
  const min = isDescending ? upper : lower;
  const max = isDescending ? lower : upper;

  const widthUnit = containerQuery ? `100cqw` : `100vw`;

  const slopeInt = `((${upperInt} - ${lowerInt}) / (${maxScreenInt} - ${minScreenInt}))`;
  const clamp = `clamp(${min}, calc(${lower} + ${slopeInt} * (${widthUnit} - ${minScreen})), ${max})`;

  return clamp;
};

export { extractTwoValidClampArgs, convertToRem, generateClamp };