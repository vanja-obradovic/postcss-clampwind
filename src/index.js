const clampwind = (opts = {}) => {
  // Helper function to check if a value contains a clamp function with exactly two arguments
  const hasClampWithTwoArgs = (value) => {
    const clampMatch = value.match(/clamp\s*\(\s*([^,]*)\s*,\s*([^,]*)\s*\)/);
    // Return true if we find a match with exactly two arguments
    return clampMatch !== null;
  };

  // TODO: Use from tailwind input css and merge + order with custom-defined ones
  let screens = {
    sm: '40rem',
    md: '48rem',
    lg: '64rem',
    xl: '80rem',
    '2xl': '96rem'
  };

  return {
    postcssPlugin: 'clampwind',
    prepare() {
      // Store references to parent media queries and their nested children with valid clamp functions
      const nestedMediaPairs = [];
      const mediaProperties = new Map();
      let breakpointVariables = null;
      
      return {
        // Add handlers for :root and other rules
        Rule: {
          '*': (rule) => {
            if (rule.selector === ':root') {
              rule.walkDecls(decl => {
                console.log('Found declaration:', decl.prop, decl.value);
                if (decl.prop.startsWith('--breakpoint')) {
                  const name = decl.prop.replace('--breakpoint-', '');
                  screens[name] = decl.value;
                  console.log('Found custom breakpoint in :root:', {
                    name,
                    value: decl.value
                  });
                }
              });
            }
          }
        },
        
        AtRule: {
          layer: (atRule) => {
            if (!breakpointVariables && atRule.source && atRule.source.input && atRule.source.input.css) {
              const css = atRule.source.input.css;
              const breakpointMatches = css.match(/--breakpoint-[^:]+:\s*[^;]+/g);
              if (breakpointMatches) {
                breakpointVariables = breakpointMatches;
                console.log('Found breakpoint variables in layer:', breakpointMatches);
              }
            }

            atRule.walkDecls(decl => {
              if (decl.prop.startsWith('--breakpoint')) {
                console.log('Found breakpoint variable in theme:', {
                  name: decl.prop,
                  value: decl.value
                });
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

clampwind.postcss = true
 
module.exports = clampwind