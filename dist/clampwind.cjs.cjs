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
var formatBreakpointsRegexMatches = (matches) => {
  return matches.reduce((acc, match) => {
    const [, name, value] = match.match(/--breakpoint-([^:]+):\s*([^;]+)/);
    acc[name.trim()] = value.trim();
    return acc;
  }, {});
};
var formatContainerBreakpointsRegexMatches = (matches) => {
  return matches.reduce((acc, match) => {
    const [, name, value] = match.match(/--container-([^:]+):\s*([^;]+)/);
    acc[`@${name.trim()}`] = value.trim();
    return acc;
  }, {});
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
    return `${value * spacingSize}rem`;
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
var generateClamp = (lower, upper, minScreen, maxScreen, rootFontSize = 16, spacingSize = 0.25, containerQuery = false) => {
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
  let rootFontSize = 16;
  let spacingSize = 0.25;
  let customProperties = {};
  let screens = defaultScreens || {};
  let containerScreens = defaultContainerScreens || {};
  let defaultLayerBreakpoints = {};
  let defaultLayerContainerBreakpoints = {};
  let themeLayerBreakpoints = {};
  let themeLayerContainerBreakpoints = {};
  let rootElementBreakpoints = {};
  let rootElementContainerBreakpoints = {};
  const noMediaQueries = [];
  const singleMediaQueries = [];
  const singleContainerQueries = [];
  const doubleNestedMediaQueries = [];
  const doubleNestedContainerQueries = [];
  return {
    postcssPlugin: "clampwind",
    prepare() {
      return {
        // MARK: Rule
        Rule(rule) {
          if (rule.selector === ":root") {
            rule.walkDecls((decl) => {
              if (decl.prop.startsWith("--breakpoint-")) {
                const key = decl.prop.replace("--breakpoint-", "");
                rootElementBreakpoints[key] = decl.value;
              }
              if (decl.prop.startsWith("--container-")) {
                const key = decl.prop.replace("--container-", "@");
                rootElementContainerBreakpoints[key] = decl.value;
              }
              if (decl.prop === "--text-base" && decl.value.includes("px")) {
                rootFontSize = parseFloat(decl.value);
              }
              if (decl.prop === "font-size" && decl.value.includes("px")) {
                rootFontSize = parseFloat(decl.value);
              }
              if (decl.prop === "--spacing") {
                spacingSize = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize, customProperties));
              }
              if (decl.prop.startsWith("--")) {
                const value = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize, customProperties));
                if (value) customProperties[decl.prop] = value;
              }
            });
            return;
          }
          const declNodes = [];
          for (const node of rule.nodes || []) {
            if (node.type === "decl" && extractTwoValidClampArgs(node.value)) {
              declNodes.push(node);
            }
          }
          const hasMediaChild = (rule.nodes || []).some(
            (n) => n.type === "atrule" && n.name === "media"
          );
          if (declNodes.length && !hasMediaChild) {
            noMediaQueries.push({ ruleNode: rule, declNodes });
          }
        },
        // MARK: AtRule
        AtRule: {
          // MARK: - - Layers
          // Collect theme variables from layers
          layer(atRule) {
            if (atRule.params === "default" && !Object.keys(defaultLayerBreakpoints).length) {
              const css = atRule.source.input.css;
              const matches = css.match(/--breakpoint-[^:]+:\s*[^;]+/g) || [];
              defaultLayerBreakpoints = formatBreakpointsRegexMatches(matches);
            }
            if (atRule.params === "default" && !Object.keys(defaultLayerContainerBreakpoints).length) {
              const css = atRule.source.input.css;
              const matches = css.match(/--container-[^:]+:\s*[^;]+/g) || [];
              defaultLayerContainerBreakpoints = formatContainerBreakpointsRegexMatches(matches);
            }
            if (atRule.params === "theme") {
              atRule.walkDecls((decl) => {
                if (decl.prop.startsWith("--breakpoint-")) {
                  const key = decl.prop.replace("--breakpoint-", "");
                  themeLayerBreakpoints[key] = decl.value;
                }
                if (decl.prop.startsWith("--container-")) {
                  const key = decl.prop.replace("--container-", "@");
                  themeLayerContainerBreakpoints[key] = decl.value;
                }
                if (decl.prop === "--text-base" && decl.value.includes("px")) {
                  rootFontSize = parseFloat(decl.value);
                }
                if (decl.prop === "--spacing") {
                  spacingSize = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize, customProperties));
                }
                if (decl.prop.startsWith("--")) {
                  const value = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize, customProperties));
                  if (value) customProperties[decl.prop] = value;
                }
              });
            }
          },
          // MARK: - - Media
          // Collect clamp() decls from single @media and nested @media
          media(atRule) {
            const isNested = atRule.parent?.type === "atrule";
            const isSameAtRule = atRule.parent?.name === atRule.name;
            const declNodes = [];
            for (const node of atRule.nodes || []) {
              if (node.type === "decl" && extractTwoValidClampArgs(node.value)) {
                declNodes.push(node);
              }
            }
            if (!declNodes.length) return;
            if (isNested && isSameAtRule) {
              doubleNestedMediaQueries.push({
                parentNode: atRule.parent,
                mediaNode: atRule,
                declNodes
              });
            } else if (isNested && !isSameAtRule) {
              declNodes.forEach((decl) => {
                decl.value = ` ${decl.value} /* Invalid nested @media and @container rules */`;
              });
            } else {
              singleMediaQueries.push({ mediaNode: atRule, declNodes });
            }
          },
          // MARK: - - Container
          // Collect clamp() decls from single @container and nested @container
          container(atRule) {
            const isNested = atRule.parent?.type === "atrule";
            const isSameAtRule = atRule.parent?.name === atRule.name;
            const declNodes = [];
            for (const node of atRule.nodes || []) {
              if (node.type === "decl" && extractTwoValidClampArgs(node.value)) {
                declNodes.push(node);
              }
            }
            if (!declNodes.length) return;
            if (isNested && isSameAtRule) {
              doubleNestedContainerQueries.push({
                parentNode: atRule.parent,
                mediaNode: atRule,
                declNodes
              });
            } else if (isNested && !isSameAtRule) {
              declNodes.forEach((decl) => {
                decl.value = ` ${decl.value} /* Invalid nested @media and @container rules */`;
              });
            } else {
              singleContainerQueries.push({ mediaNode: atRule, declNodes });
            }
          }
        },
        // MARK: OnceExit
        OnceExit() {
          screens = Object.assign(
            {},
            screens,
            defaultLayerBreakpoints,
            rootElementBreakpoints,
            themeLayerBreakpoints
          );
          screens = convertSortScreens(screens, rootFontSize);
          containerScreens = Object.assign(
            {},
            containerScreens,
            defaultLayerContainerBreakpoints,
            rootElementContainerBreakpoints,
            themeLayerContainerBreakpoints
          );
          containerScreens = convertSortScreens(containerScreens, rootFontSize);
          noMediaQueries.forEach(({ ruleNode, declNodes }) => {
            declNodes.forEach((decl) => {
              const args = extractTwoValidClampArgs(decl.value);
              const [lower, upper] = args.map((val) => convertToRem(val, rootFontSize, spacingSize, customProperties));
              if (!args || !lower || !upper) {
                decl.value = ` ${decl.value} /* Invalid clamp() values */`;
                return;
              }
              const screenValues = Object.values(screens);
              const minScreen = screenValues[0];
              const maxScreen = screenValues[screenValues.length - 1];
              const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize);
              ruleNode.append(import_postcss.default.decl({ prop: decl.prop, value: clamp }));
              decl.remove();
            });
          });
          singleMediaQueries.forEach(({ mediaNode, declNodes }) => {
            const newMediaQueries = [];
            declNodes.forEach((decl) => {
              const args = extractTwoValidClampArgs(decl.value);
              const [lower, upper] = args.map((val) => convertToRem(val, rootFontSize, spacingSize, customProperties));
              if (!args || !lower || !upper) {
                decl.value = ` ${decl.value} /* Invalid clamp() values */`;
                return;
              }
              const screenValues = Object.values(screens);
              if (mediaNode.params.includes(">")) {
                const minScreen = mediaNode.params.match(/>=?([^)]+)/)[1].trim();
                const maxScreen = screenValues[screenValues.length - 1];
                const singleMQ = import_postcss.default.atRule({ name: "media", params: `(width >= ${minScreen})` });
                const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize);
                singleMQ.append(import_postcss.default.decl({ prop: decl.prop, value: clamp }));
                newMediaQueries.push(singleMQ);
                decl.remove();
              } else if (mediaNode.params.includes("<")) {
                const minScreen = screenValues[0];
                const maxScreen = mediaNode.params.match(/<([^)]+)/)[1].trim();
                const singleMQ = import_postcss.default.atRule({ name: "media", params: mediaNode.params });
                const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize);
                singleMQ.append(import_postcss.default.decl({ prop: decl.prop, value: clamp }));
                newMediaQueries.push(singleMQ);
                decl.remove();
              }
            });
            newMediaQueries.forEach((mq) => {
              mediaNode.parent.insertBefore(mediaNode, mq);
            });
            mediaNode.remove();
          });
          singleContainerQueries.forEach(({ mediaNode, declNodes }) => {
            const newContainerQueries = [];
            declNodes.forEach((decl) => {
              const args = extractTwoValidClampArgs(decl.value);
              const [lower, upper] = args.map((val) => convertToRem(val, rootFontSize, spacingSize, customProperties));
              if (!args || !lower || !upper) {
                decl.value = ` ${decl.value} /* Invalid clamp() values */`;
                return;
              }
              const screenValues = Object.values(containerScreens);
              const containerNameMatches = mediaNode.params.match(/^([^\s(]+)\s*\(/);
              const containerName = containerNameMatches ? containerNameMatches[1].trim() : "";
              if (mediaNode.params.includes(">")) {
                const minContainer = mediaNode.params.match(/>=?([^)]+)/)[1].trim();
                const maxContainer = screenValues[screenValues.length - 1];
                const singleCQ = import_postcss.default.atRule({ name: "container", params: `${containerName} (width >= ${minContainer})` });
                const clamp = generateClamp(lower, upper, minContainer, maxContainer, rootFontSize, spacingSize, true);
                singleCQ.append(import_postcss.default.decl({ prop: decl.prop, value: clamp }));
                newContainerQueries.push(singleCQ);
                decl.remove();
              } else if (mediaNode.params.includes("<")) {
                const minContainer = screenValues[0];
                const maxContainer = mediaNode.params.match(/<([^)]+)/)[1].trim();
                const singleCQ = import_postcss.default.atRule({ name: "container", params: `${containerName} ${mediaNode.params}` });
                const clamp = generateClamp(lower, upper, minContainer, maxContainer, rootFontSize, spacingSize, true);
                singleCQ.append(import_postcss.default.decl({ prop: decl.prop, value: clamp }));
                newContainerQueries.push(singleCQ);
                decl.remove();
              }
            });
            newContainerQueries.forEach((cq) => {
              mediaNode.parent.insertBefore(mediaNode, cq);
            });
            mediaNode.remove();
          });
          doubleNestedMediaQueries.forEach(({ parentNode, mediaNode, declNodes }) => {
            declNodes.forEach((decl) => {
              const maxScreen = [parentNode.params, mediaNode.params].filter((p) => p.includes("<")).map((p) => p.match(/<([^)]+)/)[1].trim())[0];
              const minScreen = [parentNode.params, mediaNode.params].filter((p) => p.includes(">")).map((p) => p.match(/>=?([^)]+)/)[1].trim())[0];
              const args = extractTwoValidClampArgs(decl.value);
              const [lower, upper] = args.map((val) => convertToRem(val, rootFontSize, spacingSize, customProperties));
              if (!args || !lower || !upper) {
                decl.value = ` ${decl.value} /* Invalid clamp() values */`;
                return;
              }
              decl.value = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize, false);
            });
          });
          doubleNestedContainerQueries.forEach(({ parentNode, mediaNode, declNodes }) => {
            declNodes.forEach((decl) => {
              const maxContainer = [parentNode.params, mediaNode.params].filter((p) => p.includes("<")).map((p) => p.match(/<([^)]+)/)[1].trim())[0];
              const minContainer = [parentNode.params, mediaNode.params].filter((p) => p.includes(">")).map((p) => p.match(/>=?([^)]+)/)[1].trim())[0];
              const args = extractTwoValidClampArgs(decl.value);
              const [lower, upper] = args.map((val) => convertToRem(val, rootFontSize, spacingSize, customProperties));
              if (!args || !lower || !upper) {
                decl.value = ` ${decl.value} /* Invalid clamp() values */`;
                return;
              }
              decl.value = generateClamp(lower, upper, minContainer, maxContainer, rootFontSize, spacingSize, true);
            });
          });
        }
      };
    }
  };
};
clampwind.postcss = true;
var clampwind_default = clampwind;
