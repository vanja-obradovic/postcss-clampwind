import { defaultScreens, formatBreakpointsMatches, convertSortScreens } from './screens.js';

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

  return {
    postcssPlugin: 'clampwind',
    prepare() {
      // Store references to parent media queries and their nested children with valid clamp functions
      const nestedMediaPairs = [];
      const mediaProperties = new Map();
      
      return {
        Rule: {
          '*': (rule) => {
            if (rule.selector === ':root') {
              rule.walkDecls(decl => {
                // Get custom breakpoints from :root
                if (decl.prop.startsWith('--breakpoint')) {
                  const prop = decl.prop.replace('--breakpoint-', '');
                  rootElementBreakpoints[prop] = decl.value;
                }
                // Set font-size
                if (decl.prop === 'font-size' && decl.value.includes('px')) {
                  rootFontSize = parseFloat(decl.value);
                }
              });
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
                defaultLayerBreakpoints = formatBreakpointsMatches(breakpointMatches);
              }
            }

            // Get user-defined breakpoints from static theme layer
            atRule.walkDecls(decl => {
              if (atRule.params == 'theme') {
                if (decl.prop.startsWith('--breakpoint')) {
                  const prop = decl.prop.replace('--breakpoint-', '');
                  themeLayerBreakpoints[prop] = decl.value;
                }
              }
            });
          },

          media: (atRule, { result }) => {
     
            if (atRule.parent && atRule.parent.type === 'atrule' && atRule.parent.name === 'media') {
              // This is a nested media query
              const parentMedia = atRule.parent;
              
              // Collect properties with clamp() function having exactly two arguments
              const validProperties = [];
              let hasValidClamp = false;
              
              atRule.walkDecls(decl => {
                if (hasClampWithTwoArgs(decl.value)) {
                  hasValidClamp = true;
                  validProperties.push({
                    prop: decl.prop,
                    value: decl.value
                  });
                }
              });
              
              // Only store if we found valid clamp functions
              if (hasValidClamp) {
                nestedMediaPairs.push({
                  parent: parentMedia,
                  child: atRule
                });
                
                // Associate valid properties with this media query
                mediaProperties.set(atRule, validProperties);
              }
            }
          }
        },
        
        // Log filtered nested media queries after processing
        OnceExit() {

          if (screens) {
            screens = Object.assign({}, screens, defaultLayerBreakpoints, rootElementBreakpoints, themeLayerBreakpoints);
            screens = convertSortScreens(screens, rootFontSize);
            // console.log('screens', screens);
          }
          
          if (nestedMediaPairs.length > 0) {
            console.log(`Found ${nestedMediaPairs.length} nested media queries with two-argument clamp() functions:`);
            
            nestedMediaPairs.forEach(pair => {
              console.log('\nNested Media Query:');
              console.log('Parent media query:', pair.parent.params);
              console.log('Child media query:', pair.child.params);
              
              // Log properties with valid clamp functions
              const properties = mediaProperties.get(pair.child) || [];
              properties.forEach(prop => {
                console.log(`Property: ${prop.prop}, Value: ${prop.value}`);
              });
              
              console.log('-------------------');
            });
          } else {
            console.log('No nested media queries with two-argument clamp() functions found.');
          }
        }
      };
    }
  };
};

clampwind.postcss = true;
 
export default clampwind;