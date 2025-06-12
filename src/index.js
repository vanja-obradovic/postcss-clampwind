import postcss from 'postcss';
import { defaultScreens, formatRegexMatches, convertSortScreens } from './screens.js';

const clampwind = (opts = {}) => {
  // simple extractor: clamp(x,y) → [x,y]
  const extractTwoClampArgs = (value) => {
    const m = value.match(/\bclamp\s*\(\s*([^,()]+)\s*,\s*([^,()]+)\s*\)$/);
    return m ? [m[1].trim(), m[2].trim()] : null;
  };

  const hasUnit = (value) => {
    return /[a-zA-Z%]+$/.test(value);
  }

  let rootFontSize = 16;
  let spacingSize = 0.25;
  let screens = defaultScreens || {};
  let defaultLayerBreakpoints = {};
  let themeLayerBreakpoints = {};
  let rootElementBreakpoints = {};

  // Store node references + their clamp decl nodes for deferred mutation
  const noMediaQueries = [];
  const singleMediaQueries = [];
  const doubleNestedMediaQueries = [];
  const mediaProperties = new Map();

  return {
    postcssPlugin: 'clampwind',
    prepare() {
      return {
        Rule(rule) {
          if (rule.selector === ':root') {
            rule.walkDecls(decl => {
              if (decl.prop.startsWith('--breakpoint-')) {
                const key = decl.prop.replace('--breakpoint-', '');
                rootElementBreakpoints[key] = decl.value;
              }
              if (decl.prop === '--spacing' && decl.value.includes('px')) {
                spacingSize = parseFloat(decl.value) / rootFontSize;
              }
              if (decl.prop === '--text-base' && decl.value.includes('px')) {
                rootFontSize = parseFloat(decl.value);
              }
              if (decl.prop === 'font-size' && decl.value.includes('px')) {
                rootFontSize = parseFloat(decl.value);
              }
            });
            return;
          }

          // collect direct clamp() decl nodes
          const declNodes = [];
          for (const node of rule.nodes || []) {
            if (node.type === 'decl' && extractTwoClampArgs(node.value)) {
              declNodes.push(node);
            }
          }

          // skip if any @media child
          const hasMediaChild = (rule.nodes || []).some(
            n => n.type === 'atrule' && n.name === 'media'
          );

          if (declNodes.length && !hasMediaChild) {
            noMediaQueries.push({ ruleNode: rule, declNodes });
            mediaProperties.set(rule, declNodes);
          }
        },

        AtRule: {
          layer(atRule) {
            if (atRule.params === 'default' && !Object.keys(defaultLayerBreakpoints).length) {
              const css = atRule.source.input.css;
              const matches = css.match(/--breakpoint-[^:]+:\s*[^;]+/g) || [];
              defaultLayerBreakpoints = formatRegexMatches(matches);
            }
            if (atRule.params === 'theme') {
              atRule.walkDecls(decl => {
                if (decl.prop.startsWith('--breakpoint-')) {
                  const key = decl.prop.replace('--breakpoint-', '');
                  themeLayerBreakpoints[key] = decl.value;
                }
                if (decl.prop === '--spacing' && decl.value.includes('px')) {
                  spacingSize = parseFloat(decl.value) / rootFontSize;
                }
                if (decl.prop === '--text-base' && decl.value.includes('px')) {
                  rootFontSize = parseFloat(decl.value);
                }
              });
            }
          },

          media(atRule) {
            const isNested =
              atRule.parent?.type === 'atrule' && atRule.parent.name === 'media';

            const declNodes = [];
            for (const node of atRule.nodes || []) {
              if (node.type === 'decl' && extractTwoClampArgs(node.value)) {
                declNodes.push(node);
              }
            }
            if (!declNodes.length) return;

            if (isNested) {
              doubleNestedMediaQueries.push({
                parentNode: atRule.parent,
                mediaNode: atRule,
                declNodes
              });
            } else {
              singleMediaQueries.push({ mediaNode: atRule, declNodes });
            }
            mediaProperties.set(atRule, declNodes);
          }
        },

        OnceExit() {
          // Join, convert and sort screens breakpoints
          screens = Object.assign(
            {},
            screens,
            defaultLayerBreakpoints,
            rootElementBreakpoints,
            themeLayerBreakpoints
          );
          screens = convertSortScreens(screens, rootFontSize);

          // No-media rules: add from smallest to largest breakpoint and outer bounds
          noMediaQueries.forEach(({ ruleNode, declNodes }) => {
            declNodes.forEach(decl => {
              const match = decl.value.match(/clamp\s*\(\s*([^,]+)\s*,\s*([^\)]+)\)/);
              if (!match) return;
              const [, lowerRaw, upperRaw] = match;
              const lower = lowerRaw.trim();
              const upper = upperRaw.trim();

              const screenValues = Object.values(screens);
              const lowerBP = screenValues[0];
              const upperBP = screenValues[screenValues.length - 1];

              // 1) prepend lower bound
              ruleNode.insertBefore(
                decl,
                postcss.decl({ prop: decl.prop, value: lower })
              );

              // 2) nested media block
              const inner = postcss.atRule({ name: 'media', params: `(width < ${upperBP})` });
              inner.append(decl.clone());
              const outer = postcss.atRule({ name: 'media', params: `(width >= ${lowerBP})` });
              outer.append(inner);
              ruleNode.append(outer);

              // 3) upper bound
              const upperMedia = postcss.atRule({ name: 'media', params: `(width >= ${upperBP})` });
              upperMedia.append(
                postcss.decl({ prop: decl.prop, value: upper })
              );
              ruleNode.append(upperMedia);

              // 4) remove original clamp decl
              decl.remove();
            });
          });

          // Single media queries
          singleMediaQueries.forEach(({ mediaNode, declNodes }) => {
            declNodes.forEach(decl => {
              const match = decl.value.match(/clamp\s*\(\s*([^,]+)\s*,\s*([^\)]+)\)/);
              if (!match) return;
              const [, lowerRaw, upperRaw] = match;
              const lower = lowerRaw.trim();
              const upper = upperRaw.trim();

              const screenValues = Object.values(screens);
              const lowerBP = screenValues[0];
              const upperBP = screenValues[screenValues.length - 1];
              
              // Create upper breakpoints 
              if (mediaNode.params.includes('>')) {

                const inner = postcss.atRule({ name: 'media', params: `(width < ${upperBP})` });
                inner.append(decl.clone());
                mediaNode.append(inner);

                const upperMedia = postcss.atRule({ name: 'media', params: `(width >= ${upperBP})` });
                upperMedia.append(
                  postcss.decl({ prop: decl.prop, value: upper })
                );
                mediaNode.append(upperMedia);

                decl.remove();

              } else if (mediaNode.params.includes('<')) {
                // Create lower breakpoints
                mediaNode.parent.insertBefore(mediaNode, postcss.decl({ prop: decl.prop, value: lower }));

                const inner = postcss.atRule({ name: 'media', params: mediaNode.params });
                inner.append(decl.clone());

                const outer = postcss.atRule({ name: 'media', params: `(width >= ${lowerBP})` });
                outer.append(inner);

                mediaNode.replaceWith(outer);

                decl.remove();

              }
            });
          });

          // Nested-media queries
          doubleNestedMediaQueries.forEach(({ parentNode, mediaNode, declNodes }) => {
            declNodes.forEach(decl => { 

              const maxScreen = ([parentNode.params, mediaNode.params])
                .filter(p => p.includes('<'))
                .map(p => p.match(/<([^)]+)/)[1].trim())[0]
              
              const minScreen = ([parentNode.params, mediaNode.params])
                .filter(p => p.includes('>'))
                .map(p => p.match(/>=?([^)]+)/)[1].trim())[0]

              console.log('maxScreen', maxScreen)
              console.log('minScreen', minScreen)

              const maxScreenInt = parseFloat(maxScreen.includes('px') ? maxScreen.replace('px', '') / rootFontSize : maxScreen)
              const minScreenInt = parseFloat(minScreen.includes('px') ? minScreen.replace('px', '') / rootFontSize : minScreen)

              console.log('maxScreenInt', maxScreenInt)
              console.log('minScreenInt', minScreenInt)

              const [lower, upper] = extractTwoClampArgs(decl.value).map(val => val.includes('px') ? `${val.replace('px', '') / rootFontSize}rem` : val);

              console.log('lower', lower)
              console.log('upper', upper)

              const lowerInt = parseFloat(hasUnit(lower) ? lower : `${lower * spacingSize}rem`)
              const upperInt = parseFloat(hasUnit(upper) ? upper : `${upper * spacingSize}rem`)

              console.log('lowerInt', lowerInt)
              console.log('upperInt', upperInt)

              const isDescending = lowerInt > upperInt
              const min = isDescending ? upper : lower
              const max = isDescending ? lower : upper

              console.log('min', min)
              console.log('max', max)

              const slopeInt = `((${upperInt} - ${lowerInt}) / (${maxScreenInt} - ${minScreenInt}))`
              const clamp = `clamp(${hasUnit(min) ? min : `${min * spacingSize}rem`}, calc(${hasUnit(lower) ? lower : `${lower * spacingSize}rem`} + ${slopeInt} * (100vw - ${minScreen})), ${hasUnit(max) ? max : `${max * spacingSize}rem`})`

              console.log('clamp', clamp)

              decl.value = clamp
            });
          });
        }
      };
    }
  };
};

clampwind.postcss = true;
export default clampwind;