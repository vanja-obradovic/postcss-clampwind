import { defaultScreens, formatRegexMatches, convertSortScreens } from './screens.js';

const clampwind = (opts = {}) => {
  // Helper function to check if a value contains a clamp function with exactly two arguments
  const hasClampWithTwoArgs = (value) => {
    const clampMatch = value.match(/clamp\s*\(\s*([^,]*)\s*,\s*([^,]*)\s*\)/);
    return clampMatch !== null;
  };

  let rootFontSize = 16;
  let screens = defaultScreens || {};
  let defaultLayerBreakpoints = {};
  let themeLayerBreakpoints = {};
  let rootElementBreakpoints = {};

  const noMediaQueries = [];
  const singleMediaQueries = [];
  const doubleNestedMediaQueries = [];
  const mediaProperties = new Map();

  return {
    postcssPlugin: 'clampwind',
    prepare() {
      
      return {
        Rule: {
          '*': (rule) => {
            if (rule.selector === ':root') {
              // Get custom breakpoints from :root
              rule.walkDecls(decl => {
                if (decl.prop.startsWith('--breakpoint-')) {
                  const prop = decl.prop.replace('--breakpoint-', '');
                  rootElementBreakpoints[prop] = decl.value;
                }
                // Get font-size from --text-base declaration
                if (decl.prop === '--text-base' && decl.value.includes('px')) {
                  rootFontSize = parseFloat(decl.value);
                }
                // Set font-size from font-size declaration
                if (decl.prop === 'font-size' && decl.value.includes('px')) {
                  rootFontSize = parseFloat(decl.value);
                }
              });
              return;
            }

            // collect direct clamp() decls
            const directProps = [];
            if (Array.isArray(rule.nodes)) {
              rule.nodes.forEach(node => {
                if (node.type === 'decl' && hasClampWithTwoArgs(node.value)) {
                  directProps.push({ prop: node.prop, value: node.value });
                }
              });
            }

            // only if we found clamp() and there are NO @media children
            const hasMediaChild = Array.isArray(rule.nodes) &&
              rule.nodes.some(n => n.type === 'atrule' && n.name === 'media');

            if (directProps.length && !hasMediaChild) {
              noMediaQueries.push({
                rule,
                properties: directProps
              });
              mediaProperties.set(rule, directProps);
            }
          }
        },
        
        AtRule: {
          layer: (atRule) => {
            // Get default breakpoints from default tailwind layer
            if (!defaultLayerBreakpoints.length && atRule.source && atRule.source.input && atRule.source.input.css) {
              const css = atRule.source.input.css;
              const breakpointMatches = css.match(/--breakpoint-[^:]+:\s*[^;]+/g);
              if (breakpointMatches) {
                defaultLayerBreakpoints = formatRegexMatches(breakpointMatches);
              }
            }

            atRule.walkDecls(decl => {
              if (atRule.params == 'theme') {
                // Get user-defined breakpoints from static theme layer
                if (decl.prop.startsWith('--breakpoint')) {
                  const prop = decl.prop.replace('--breakpoint-', '');
                  themeLayerBreakpoints[prop] = decl.value;
                }
                // Get font-size from static theme layer
                if (decl.prop === '--text-base' && decl.value.includes('px')) {
                  rootFontSize = parseFloat(decl.value);
                }
              }
            });
          },

          media: (atRule) => {
            // Find if this @media rule is nested
            const isNested =
              atRule.parent?.type === 'atrule' && atRule.parent.name === 'media';
        
            // Collect all properties with clamp() having two args
            const validProperties = [];
            if (Array.isArray(atRule.nodes)) {
              atRule.nodes.forEach(node => {
                if (node.type === 'decl' && hasClampWithTwoArgs(node.value)) {
                  validProperties.push({ prop: node.prop, value: node.value });
                }
              });
            }
        
            if (!validProperties.length) return;
        
            if (isNested) {
              doubleNestedMediaQueries.push({
                parent: atRule.parent,
                child: atRule
              });
            } else {
              singleMediaQueries.push(atRule);
            }
        
            mediaProperties.set(atRule, validProperties);
          }
        },
        
        OnceExit() {

          if (screens) {
            screens = Object.assign({}, screens, defaultLayerBreakpoints, rootElementBreakpoints, themeLayerBreakpoints);
            screens = convertSortScreens(screens, rootFontSize);
            // console.log('screens', screens);
          }
          
           // no‐media
           if (noMediaQueries.length) {
            console.log(`\nFound ${noMediaQueries.length} rules with clamp() and NO @media:`);
            noMediaQueries.forEach(({ rule, properties }) => {
              console.log(`  selector: ${rule.selector}`);
              properties.forEach(d => {
                console.log(`    ${d.prop}: ${d.value}`);
              });
            });
          } else {
            console.log('No rules with clamp() outside of media queries found.');
          }

          // single‐media
          if (singleMediaQueries.length) {
            console.log(`\nFound ${singleMediaQueries.length} single-media rules:`);
            singleMediaQueries.forEach(atRule => {
              console.log(`  @media ${atRule.params}`);
              mediaProperties.get(atRule).forEach(d => {
                console.log(`    ${d.prop}: ${d.value}`);
              });
            });
          } else {
            console.log('No single-media rules found.');
          }

          // double nested media queries
          if (doubleNestedMediaQueries.length) {
            console.log(`\nFound ${doubleNestedMediaQueries.length} nested-media rules:`);
            doubleNestedMediaQueries.forEach(({ parent, child }) => {
              console.log(`  parent: @media ${parent.params}`);
              console.log(`  child:  @media ${child.params}`);
              mediaProperties.get(child).forEach(d => {
                console.log(`    ${d.prop}: ${d.value}`);
              });
            });
          } else {
            console.log('No nested-media rules found.');
          }
        }
      };
    }
  };
};

clampwind.postcss = true;
 
export default clampwind;