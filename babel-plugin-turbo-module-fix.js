module.exports = function() {
  return {
    visitor: {
      CallExpression(path) {
        const { node } = path;
        
        // Check if this is a TurboModuleRegistry.getEnforcing call
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'TurboModuleRegistry' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'getEnforcing'
        ) {
          // Replace with a safe fallback
          path.replaceWith(
            {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'Identifier',
                  name: 'TurboModuleRegistry'
                },
                property: {
                  type: 'Identifier',
                  name: 'get'
                }
              },
              arguments: node.arguments
            }
          );
        }
      }
    }
  };
}; 