import postcss from 'postcss';
import { defaultScreens, formatRegexMatches, convertSortScreens } from './screens.js';
import { extractTwoClampArgs, convertToRem, generateClamp } from './clamp.js';

const clampwind = (opts = {}) => {
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
              if (decl.prop === '--text-base' && decl.value.includes('px')) {
                rootFontSize = parseFloat(decl.value);
              }
              if (decl.prop === 'font-size' && decl.value.includes('px')) {
                rootFontSize = parseFloat(decl.value);
              }
              if (decl.prop === '--spacing') {
                spacingSize = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize));
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
                if (decl.prop === '--text-base' && decl.value.includes('px')) {
                  rootFontSize = parseFloat(decl.value);
                }
                if (decl.prop === '--spacing') {
                  spacingSize = parseFloat(convertToRem(decl.value, rootFontSize, spacingSize));
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

          // No-media rules: add from smallest to largest breakpoint and outerMQ bounds
          noMediaQueries.forEach(({ ruleNode, declNodes }) => {
            declNodes.forEach(decl => {

              const args = extractTwoClampArgs(decl.value);
              const [lower, upper] = args.map(val => convertToRem(val, rootFontSize, spacingSize));
              if (!args || !lower || !upper) return;

              const screenValues = Object.values(screens);
              const minScreen = screenValues[0];
              const maxScreen = screenValues[screenValues.length - 1];

              // 1) prepend lower bound
              const lowerMQ = postcss.atRule({ name: 'media', params: `(width < ${minScreen})` });
              lowerMQ.append(postcss.decl({ prop: decl.prop, value: lower }));
              ruleNode.insertBefore(
                decl,
                lowerMQ
              );

              // 2) nested media block
              const innerMQ = postcss.atRule({ name: 'media', params: `(width < ${maxScreen})` });
              const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize)
              innerMQ.append(postcss.decl({ prop: decl.prop, value: clamp }));

              const outerMQ = postcss.atRule({ name: 'media', params: `(width >= ${minScreen})` });
              outerMQ.append(innerMQ);
              ruleNode.append(outerMQ);

              // 3) upper bound
              const upperMQ = postcss.atRule({ name: 'media', params: `(width >= ${maxScreen})` });
              upperMQ.append(
                postcss.decl({ prop: decl.prop, value: upper })
              );
              ruleNode.append(upperMQ);

              // 4) remove original clamp decl
              decl.remove();
            });
          });

          // Single media queries
          singleMediaQueries.forEach(({ mediaNode, declNodes }) => {
            declNodes.forEach(decl => {

              const args = extractTwoClampArgs(decl.value);
              const [lower, upper] = args.map(val => convertToRem(val, rootFontSize, spacingSize));
              if (!args || !lower || !upper) return;

              const screenValues = Object.values(screens);              
              
              // Create upper breakpoints 
              if (mediaNode.params.includes('>')) {

                const minScreen = mediaNode.params.match(/>=?([^)]+)/)[1].trim()
                const maxScreen = screenValues[screenValues.length - 1];

                const innerMQ = postcss.atRule({ name: 'media', params: `(width < ${maxScreen})` });
                const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize)
                innerMQ.append(postcss.decl({ prop: decl.prop, value: clamp }));
                mediaNode.append(innerMQ);

                const upperMQ = postcss.atRule({ name: 'media', params: `(width >= ${maxScreen})` });
                upperMQ.append(
                  postcss.decl({ prop: decl.prop, value: upper })
                );
                mediaNode.append(upperMQ);

                decl.remove();

              } else if (mediaNode.params.includes('<')) {
                // Create lower breakpoints

                const minScreen = screenValues[0];
                const maxScreen = mediaNode.params.match(/<([^)]+)/)[1].trim()

                const lowerMQ = postcss.atRule({ name: 'media', params: `(width < ${minScreen})` });
                lowerMQ.append(postcss.decl({ prop: decl.prop, value: lower }));
                mediaNode.parent.insertBefore(mediaNode, lowerMQ);

                const innerMQ = postcss.atRule({ name: 'media', params: mediaNode.params });
                const clamp = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize)
                innerMQ.append(postcss.decl({ prop: decl.prop, value: clamp }));

                const outerMQ = postcss.atRule({ name: 'media', params: `(width >= ${minScreen})` });
                outerMQ.append(innerMQ);

                mediaNode.replaceWith(outerMQ);

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

              const args = extractTwoClampArgs(decl.value);
              const [lower, upper] = args.map(val => convertToRem(val, rootFontSize, spacingSize));
              if (!args || !lower || !upper) return;

              decl.value = generateClamp(lower, upper, minScreen, maxScreen, rootFontSize, spacingSize)
            });
          });
        }
      };
    }
  };
};

clampwind.postcss = true;
export default clampwind;