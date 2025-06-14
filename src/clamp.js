/**
 * Extract two clamp args from a string
 * @param {string} value - The value to extract the clamp args from
 * @returns {Array<string>} The lower and upper clamp args
 */
const extractTwoClampArgs = (value) => {
  const m = value.match(/\bclamp\s*\(\s*([^,()]+)\s*,\s*([^,()]+)\s*\)$/);
  return m ? [m[1].trim(), m[2].trim()] : null;
};

/**
 * Check if a value has a unit
 * @param {string} value - The value to check
 * @returns {boolean} True if the value has a unit, false otherwise
 */
const hasUnit = (value) => {
  return /[a-zA-Z%]+$/.test(value);
};

/**
 * List of units that are not allowed
 * @type {Array<string>}
 */
const notAllowedUnits = ["%"];

// convert to rem if px or has unit, otherwise return value
const convertToRem = (value, rootFontSize, spacingSize) => {
  if (notAllowedUnits.some((unit) => value.includes(unit))) {
    return null;
  }

  if (value.includes("px")) {
    return `${value.replace("px", "") / rootFontSize}rem`;
  }

  if (hasUnit(value)) {
    return value;
  }

  return `${value * spacingSize}rem`;
};

/**
 * Generate a clamp function
 * @param {string} lower - The lower clamp arg
 * @param {string} upper - The upper clamp arg
 * @param {string} minScreen - The minimum screen size
 * @param {string} maxScreen - The maximum screen size
 * @param {number} rootFontSize - The root font size
 * @param {number} spacingSize - The spacing size
 * @returns {string} The generated clamp function
 */
const generateClamp = (
  lower,
  upper,
  minScreen,
  maxScreen,
  rootFontSize,
  spacingSize
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

  const slopeInt = `((${upperInt} - ${lowerInt}) / (${maxScreenInt} - ${minScreenInt}))`;
  const clamp = `clamp(${min}, calc(${lower} + ${slopeInt} * (100vw - ${minScreen})), ${max})`;

  return clamp;
};

export { extractTwoClampArgs, convertToRem, generateClamp };