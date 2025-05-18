const clampwind = (opts = {}) => {
  // Helper function to check if a value contains a clamp function with exactly two arguments
  const hasClampWithTwoArgs = (value) => {
    const clampMatch = value.match(/clamp\s*\(\s*([^,]*)\s*,\s*([^,]*)\s*\)/);
    // Return true if we find a match with exactly two arguments
    return clampMatch !== null;
  };

  return {
    postcssPlugin: 'clampwind',
    prepare() {
      // Store references to parent media queries and their nested children with valid clamp functions
      const nestedMediaPairs = [];
      const mediaProperties = new Map();
      
      return {
        // Faster specific AtRule listener for media
        AtRule: {
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