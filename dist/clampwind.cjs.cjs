var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/clampwind.js
var clampwind_exports = {};
__export(clampwind_exports, {
  default: () => clampwind_default
});
module.exports = __toCommonJS(clampwind_exports);
var import_postcss = __toESM(require("postcss"), 1);

// src/screens.js
var defaultScreens = {
  sm: "40rem",
  // 640px
  md: "48rem",
  // 768px
  lg: "64rem",
  // 1024px
  xl: "80rem",
  // 1280px
  "2xl": "96rem"
  // 1536px
};
var defaultContainerScreens = {
  "@3xs": "16rem",
  // 256px
  "@2xs": "18rem",
  // 288px
  "@xs": "20rem",
  // 320px
  "@sm": "24rem",
  // 384px
  "@md": "28rem",
  // 448px
  "@lg": "32rem",
  // 512px
  "@xl": "36rem",
  // 576px
  "@2xl": "42rem",
  // 672px
  "@3xl": "48rem",
  // 768px
  "@4xl": "56rem",
  // 896px
  "@5xl": "64rem",
  // 1024px
  "@6xl": "72rem",
  // 1152px
  "@7xl": "80rem"
  // 1280px
};
var convertSortScreens = (screens, rootFontSize = 16) => {
  const convertedScreens = Object.entries(screens).reduce((acc, [key, value]) => {
    if (value.includes("px")) {
      const pxValue = parseFloat(value);
      acc[key] = `${pxValue / rootFontSize}rem`;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
  const sortedKeys = Object.keys(convertedScreens).sort((a, b) => {
    const aValue = parseFloat(convertedScreens[a]);
    const bValue = parseFloat(convertedScreens[b]);
    return aValue - bValue;
  });
  return sortedKeys.reduce((acc, key) => {
    acc[key] = convertedScreens[key];
    return acc;
  }, {});
};

// src/utils.js
var extractTwoValidClampArgs = (value) => {
  const m = value.match(/\bclamp\s*\(\s*(var\([^()]+\)|[^,()]+)\s*,\s*(var\([^()]+\)|[^,()]+)\s*\)$/);
  return m ? [m[1].trim(), m[2].trim()] : null;
};
var extractUnit = (value) => {
  const trimmedValue = value.replace(/\s+/g, "");
  if (trimmedValue.includes("--")) {
    const match = trimmedValue.replace(/var\(([^,)]+)[^)]*\)/, "$1");
    return match ? match : null;
  } else {
    const match = trimmedValue.match(/\D+$/);
    return match ? match[0] : null;
  }
};
var formatProperty = (value) => {
  const trimmedValue = value.replace(/\s+/g, "");
  return trimmedValue.replace(/var\(([^,)]+)[^)]*\)/, "$1");
};
var convertToRem = (value, rootFontSize, spacingSize, customProperties = {}) => {
  const unit = extractUnit(value);
  const formattedProperty = formatProperty(value);
  const fallbackValue = value.includes("var(") && value.includes(",") ? value.replace(/var\([^,]+,\s*([^)]+)\)/, "$1") : null;
  if (!unit) {
    const spacingSizeInt = parseFloat(spacingSize);
    const spacingUnit = extractUnit(spacingSize);
    if (spacingUnit === "px") {
      return `${value * spacingSizeInt / rootFontSize}rem`;
    }
    if (spacingUnit === "rem") {
      return `${value * spacingSizeInt}rem`;
    }
  }
  if (unit === "px") {
    return `${value.replace("px", "") / rootFontSize}rem`;
  }
  if (unit === "rem") {
    return value;
  }
  if (customProperties[formattedProperty]) {
    return `${customProperties[formattedProperty]}rem`;
  }
  if (formattedProperty && !customProperties[formattedProperty] && fallbackValue) {
    const fallbackUnit = extractUnit(fallbackValue);
    if (!fallbackUnit) {
      return `${fallbackValue * spacingSize}rem`;
    }
    if (fallbackUnit === "px") {
      return `${fallbackValue.replace("px", "") / rootFontSize}rem`;
    }
    if (fallbackUnit === "rem") {
      return fallbackValue;
    }
  }
  return null;
};
var generateClamp = (lower, upper, minScreen, maxScreen, rootFontSize = 16, spacingSize = "1px", containerQuery = false) => {
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
  const slopeInt = parseFloat(((upperInt - lowerInt) / (maxScreenInt - minScreenInt)).toFixed(4));
  const clamp = `clamp(${min}, calc(${lower} + ${slopeInt} * (${widthUnit} - ${minScreen})), ${max})`;
  return clamp;
};

// src/clampwind.js
var clampwind = (opts = {}) => {
  return {
    postcssPlugin: "clampwind",
    prepare() {
      let rootFontSize = 16;
      let spacingSize = "1px";
      let customProperties = {};
      let screens = defaultScreens || {};
      let containerScreens = defaultContainerScreens || {};
      const config = {
        defaultLayerBreakpoints: {},
        defaultLayerContainerBreakpoints: {},
        themeLayerBreakpoints: {},
        themeLayerContainerBreakpoints: {},
        rootElementBreakpoints: {},
        rootElementContainerBreakpoints: {},
        configCollected: false,
        configReady: false
      };
      const collectConfig = (root) => {
        if (config.configCollected) return;
        root.walkDecls((decl) => {
          if (decl.parent?.selector === ":root") {
            if (decl.prop === "font-size" && decl.value.includes("px")) {
              rootFontSize = parseFloat(decl.value);
            }
            if (decl.prop === "--text-base" && decl.value.includes("px")) {
              rootFontSize = parseFloat(decl.value);
            }
          }
        });
        root.walkDecls((decl) => {
          if (decl.parent?.selector === ":root") {
            if (decl.prop.startsWith("--breakpoint-")) {
              const key = decl.prop.replace("--breakpoint-", "");
              config.rootElementBreakpoints[key] = decl.value;
            }
            if (decl.prop.startsWith("--container-")) {
              const key = decl.prop.replace("--container-", "@");
              config.rootElementContainerBreakpoints[key] = decl.value;
            }
            if (decl.prop === "--spacing") {
              spacingSize = decl.value;
            }
            if (decl.prop.startsWith("--")) {
              const value = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize, customProperties));
              if (value) customProperties[decl.prop] = value;
            }
          }
        });
        root.walkAtRules("layer", (atRule) => {
          if (atRule.params === "theme") {
            atRule.walkDecls((decl) => {
              if (decl.prop === "--text-base" && decl.value.includes("px")) {
                rootFontSize = parseFloat(decl.value);
              }
            });
          }
        });
        root.walkAtRules("layer", (atRule) => {
          if (atRule.params === "default") {
            if (!Object.keys(config.defaultLayerBreakpoints).length) {
              atRule.walkDecls((decl) => {
                if (decl.prop.startsWith("--breakpoint-")) {
                  const key = decl.prop.replace("--breakpoint-", "");
                  config.defaultLayerBreakpoints[key] = decl.value;
                }
                if (decl.prop.startsWith("--container-")) {
                  const key = decl.prop.replace("--container-", "@");
                  config.defaultLayerContainerBreakpoints[key] = decl.value;
                }
              });
            }
          }
          if (atRule.params === "theme") {
            atRule.walkDecls((decl) => {
              if (decl.prop.startsWith("--breakpoint-")) {
                const key = decl.prop.replace("--breakpoint-", "");
                config.themeLayerBreakpoints[key] = decl.value;
              }
              if (decl.prop.startsWith("--container-")) {
                const key = decl.prop.replace("--container-", "@");
                config.themeLayerContainerBreakpoints[key] = decl.value;
              }
              if (decl.prop === "--spacing") {
                spacingSize = decl.value;
              }
              if (decl.prop.startsWith("--")) {
                const value = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize, customProperties));
                if (value) customProperties[decl.prop] = value;
              }
            });
          }
        });
        config.configCollected = true;
      };
      const finalizeConfig = () => {
        if (config.configReady) return;
        screens = Object.assign(
          {},
          screens,
          config.defaultLayerBreakpoints,
          config.rootElementBreakpoints,
          config.themeLayerBreakpoints
        );
        screens = convertSortScreens(screens, rootFontSize);
        containerScreens = Object.assign(
          {},
          containerScreens,
          config.defaultLayerContainerBreakpoints,
          config.rootElementContainerBreakpoints,
          config.themeLayerContainerBreakpoints
        );
        containerScreens = convertSortScreens(containerScreens, rootFontSize);
        config.configReady = true;
      };
      const processClampDeclaration = (decl, minScreen, maxScreen, isContainer = false) => {
        const args = extractTwoValidClampArgs(decl.value);
        const [lower, upper] = args.map((val) => convertToRem(val, rootFontSize, spacingSize, customProperties));
        if (!args || !lower || !upper) {
          console.warn("Invalid clamp() values", { node: decl });
          decl.value = ` ${decl.value} /* Invalid clamp() values */`;
          return true;
        }
        const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize, isContainer);
        decl.value = clamp;
        return true;
      };
      return {
        // Use OnceExit to ensure Tailwind has generated its content
        OnceExit(root, { result }) {
          collectConfig(root);
          finalizeConfig();
          root.walkAtRules("media", (atRule) => {
            const isNested = atRule.parent?.type === "atrule";
            const isSameAtRule = atRule.parent?.name === atRule.name;
            const clampDecls = [];
            atRule.walkDecls((decl) => {
              if (extractTwoValidClampArgs(decl.value)) {
                clampDecls.push(decl);
              }
            });
            if (!clampDecls.length) return;
            if (isNested && isSameAtRule) {
              const parentParams = atRule.parent.params;
              const currentParams = atRule.params;
              let minScreen = null;
              let maxScreen = null;
              if (parentParams.includes(">")) {
                const match = parentParams.match(/>=?\s*([^)]+)/);
                if (match) minScreen = match[1].trim();
              }
              if (currentParams.includes(">") && !minScreen) {
                const match = currentParams.match(/>=?\s*([^)]+)/);
                if (match) minScreen = match[1].trim();
              }
              if (parentParams.includes("<")) {
                const match = parentParams.match(/<\s*([^)]+)/);
                if (match) maxScreen = match[1].trim();
              }
              if (currentParams.includes("<") && !maxScreen) {
                const match = currentParams.match(/<\s*([^)]+)/);
                if (match) maxScreen = match[1].trim();
              }
              if (minScreen && maxScreen) {
                clampDecls.forEach((decl) => {
                  processClampDeclaration(decl, minScreen, maxScreen, false);
                });
              }
              return;
            }
            if (isNested && !isSameAtRule) {
              clampDecls.forEach((decl) => {
                decl.value = ` ${decl.value} /* Invalid nested @media rules */`;
              });
              return;
            }
            const screenValues = Object.values(screens);
            clampDecls.forEach((decl) => {
              if (atRule.params.includes(">")) {
                const match = atRule.params.match(/>=?\s*([^)]+)/);
                if (match) {
                  const minScreen = match[1].trim();
                  const maxScreen = screenValues[screenValues.length - 1];
                  processClampDeclaration(decl, minScreen, maxScreen, false);
                }
              } else if (atRule.params.includes("<")) {
                const match = atRule.params.match(/<\s*([^)]+)/);
                if (match) {
                  const minScreen = screenValues[0];
                  const maxScreen = match[1].trim();
                  processClampDeclaration(decl, minScreen, maxScreen, false);
                }
              }
            });
          });
          root.walkAtRules("container", (atRule) => {
            const isNested = atRule.parent?.type === "atrule";
            const isSameAtRule = atRule.parent?.name === atRule.name;
            const clampDecls = [];
            atRule.walkDecls((decl) => {
              if (extractTwoValidClampArgs(decl.value)) {
                clampDecls.push(decl);
              }
            });
            if (!clampDecls.length) return;
            if (isNested && isSameAtRule) {
              const parentParams = atRule.parent.params;
              const currentParams = atRule.params;
              let minContainer = null;
              let maxContainer = null;
              if (parentParams.includes(">")) {
                const match = parentParams.match(/>=?\s*([^)]+)/);
                if (match) minContainer = match[1].trim();
              }
              if (currentParams.includes(">") && !minContainer) {
                const match = currentParams.match(/>=?\s*([^)]+)/);
                if (match) minContainer = match[1].trim();
              }
              if (parentParams.includes("<")) {
                const match = parentParams.match(/<\s*([^)]+)/);
                if (match) maxContainer = match[1].trim();
              }
              if (currentParams.includes("<") && !maxContainer) {
                const match = currentParams.match(/<\s*([^)]+)/);
                if (match) maxContainer = match[1].trim();
              }
              if (minContainer && maxContainer) {
                clampDecls.forEach((decl) => {
                  processClampDeclaration(decl, minContainer, maxContainer, true);
                });
              }
              return;
            }
            if (isNested && !isSameAtRule) {
              clampDecls.forEach((decl) => {
                decl.value = ` ${decl.value} /* Invalid nested @container rules */`;
              });
              return;
            }
            const screenValues = Object.values(containerScreens);
            clampDecls.forEach((decl) => {
              if (atRule.params.includes(">")) {
                const match = atRule.params.match(/>=?\s*([^)]+)/);
                if (match) {
                  const minContainer = match[1].trim();
                  const maxContainer = screenValues[screenValues.length - 1];
                  processClampDeclaration(decl, minContainer, maxContainer, true);
                }
              } else if (atRule.params.includes("<")) {
                const match = atRule.params.match(/<\s*([^)]+)/);
                if (match) {
                  const minContainer = screenValues[0];
                  const maxContainer = match[1].trim();
                  processClampDeclaration(decl, minContainer, maxContainer, true);
                }
              }
            });
          });
          root.walkRules((rule) => {
            let parent = rule.parent;
            while (parent) {
              if (parent.type === "atrule" && (parent.name === "media" || parent.name === "container")) {
                return;
              }
              parent = parent.parent;
            }
            const clampDecls = [];
            rule.walkDecls((decl) => {
              if (extractTwoValidClampArgs(decl.value)) {
                clampDecls.push(decl);
              }
            });
            if (clampDecls.length === 0) return;
            const screenValues = Object.values(screens);
            const minScreen = screenValues[0];
            const maxScreen = screenValues[screenValues.length - 1];
            clampDecls.forEach((decl) => {
              processClampDeclaration(decl, minScreen, maxScreen, false);
            });
          });
        }
      };
    }
  };
};
clampwind.postcss = true;
var clampwind_default = clampwind;
