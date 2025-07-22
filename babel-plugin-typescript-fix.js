module.exports = function() {
  return {
    visitor: {
      // Handle TypeScript type annotations in variable declarations
      VariableDeclarator(path) {
        const { node } = path;
        if (node.id && node.id.typeAnnotation) {
          // Remove type annotations from variable declarations
          delete node.id.typeAnnotation;
        }
      },
      
      // Handle TypeScript type annotations in function parameters
      Function(path) {
        const { node } = path;
        if (node.params) {
          node.params.forEach(param => {
            if (param.typeAnnotation) {
              delete param.typeAnnotation;
            }
          });
        }
        if (node.returnType) {
          delete node.returnType;
        }
      },
      
      // Handle TypeScript interface and type declarations
      TSInterfaceDeclaration(path) {
        path.remove();
      },
      
      TSTypeAliasDeclaration(path) {
        path.remove();
      },
      
      // Handle TypeScript type assertions
      TSTypeAssertion(path) {
        path.replaceWith(path.node.expression);
      },
      
      // Handle TypeScript as expressions
      TSAsExpression(path) {
        path.replaceWith(path.node.expression);
      },
      
      // Handle TypeScript non-null assertions
      TSNonNullExpression(path) {
        path.replaceWith(path.node.expression);
      },
      
      // Handle TypeScript generic types
      TSTypeParameterInstantiation(path) {
        path.remove();
      },
      
      // Handle TypeScript indexed access types
      TSIndexedAccessType(path) {
        path.replaceWith({
          type: 'Identifier',
          name: 'any'
        });
      },
      
      // Handle TypeScript conditional types
      TSConditionalType(path) {
        path.replaceWith({
          type: 'Identifier',
          name: 'any'
        });
      },
      
      // Handle TypeScript mapped types
      TSMappedType(path) {
        path.replaceWith({
          type: 'Identifier',
          name: 'any'
        });
      },
      
      // Handle TypeScript utility types
      TSTypeReference(path) {
        if (path.node.typeName && path.node.typeName.type === 'Identifier') {
          const typeName = path.node.typeName.name;
          if (typeName === '$NonMaybeType' || typeName === '$ReadOnly' || 
              typeName === '$Exact' || typeName === '$Shape' || 
              typeName === 'typeof' || typeName.startsWith('$')) {
            path.replaceWith({
              type: 'Identifier',
              name: 'any'
            });
          }
        }
      },
      
      // Handle specific React Native syntax like "const ActivityIndicatorWithRef: component("
      CallExpression(path) {
        const { node } = path;
        if (node.callee && node.callee.type === 'Identifier' && node.callee.name === 'component') {
          // Replace component() calls with a simple function
          path.replaceWith({
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'forwardRef'
            },
            arguments: [
              {
                type: 'FunctionExpression',
                params: [],
                body: {
                  type: 'BlockStatement',
                  body: []
                }
              }
            ]
          });
        }
      },
      
      // Handle variable declarations with type annotations like "const ActivityIndicatorWithRef: component"
      VariableDeclarator(path) {
        const { node } = path;
        if (node.id && node.id.typeAnnotation) {
          // Remove the type annotation
          delete node.id.typeAnnotation;
        }
        // Also handle the case where the init is a call to component()
        if (node.init && node.init.type === 'CallExpression' && 
            node.init.callee && node.init.callee.type === 'Identifier' && 
            node.init.callee.name === 'component') {
          // Replace with a simple forwardRef call
          node.init = {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'forwardRef'
            },
            arguments: [
              {
                type: 'FunctionExpression',
                params: [],
                body: {
                  type: 'BlockStatement',
                  body: []
                }
              }
            ]
          };
        }
      },
      
      // Handle object property assignments with TypeScript syntax
      ObjectProperty(path) {
        const { node } = path;
        if (node.value && node.value.type === 'TSAsExpression') {
          // Replace TSAsExpression with just the expression
          node.value = node.value.expression;
        }
        if (node.value && node.value.type === 'TSTypeAssertion') {
          // Replace TSTypeAssertion with just the expression
          node.value = node.value.expression;
        }
      },
      
      // Handle member expressions with TypeScript syntax
      MemberExpression(path) {
        const { node } = path;
        if (node.property && node.property.type === 'TSIndexedAccessType') {
          // Replace TSIndexedAccessType with a simple identifier
          node.property = {
            type: 'Identifier',
            name: 'any'
          };
        }
      },
      
      // Handle function expressions with TypeScript syntax
      FunctionExpression(path) {
        const { node } = path;
        if (node.params) {
          node.params.forEach(param => {
            if (param.typeAnnotation) {
              delete param.typeAnnotation;
            }
          });
        }
        if (node.returnType) {
          delete node.returnType;
        }
      },
      
      // Handle arrow function expressions with TypeScript syntax
      ArrowFunctionExpression(path) {
        const { node } = path;
        if (node.params) {
          node.params.forEach(param => {
            if (param.typeAnnotation) {
              delete param.typeAnnotation;
            }
          });
        }
        if (node.returnType) {
          delete node.returnType;
        }
      },
      
      // Handle conditional expressions with TypeScript syntax
      ConditionalExpression(path) {
        const { node } = path;
        // Handle the case where the consequent or alternate has TypeScript syntax
        if (node.consequent && node.consequent.type === 'TSAsExpression') {
          node.consequent = node.consequent.expression;
        }
        if (node.alternate && node.alternate.type === 'TSAsExpression') {
          node.alternate = node.alternate.expression;
        }
      },
      
      // Handle logical expressions with TypeScript syntax
      LogicalExpression(path) {
        const { node } = path;
        if (node.left && node.left.type === 'TSAsExpression') {
          node.left = node.left.expression;
        }
        if (node.right && node.right.type === 'TSAsExpression') {
          node.right = node.right.expression;
        }
      },
      
      // Handle parenthesized expressions with TypeScript syntax
      ParenthesizedExpression(path) {
        const { node } = path;
        if (node.expression && node.expression.type === 'TSAsExpression') {
          node.expression = node.expression.expression;
        }
      },
    }
  };
}; 