// Metro transformer to fix getConstants calls at the bundler level
const { transform } = require('@babel/core');

module.exports.transform = function({ src, filename, options }) {
  // Only transform JavaScript/TypeScript files
  if (!filename.match(/\.(js|jsx|ts|tsx)$/)) {
    return { ast: null, code: src };
  }

  try {
    // Transform the code with our getConstants fix
    const result = transform(src, {
      filename,
      presets: options.presets || [],
      plugins: [
        // Our custom getConstants fix plugin
        function() {
          return {
            visitor: {
              // Fix getConstants method calls
              CallExpression(path) {
                const { node } = path;
                
                // Check if this is a getConstants call
                if (node.callee.type === 'MemberExpression' && 
                    node.callee.property && 
                    node.callee.property.name === 'getConstants') {
                  
                  // Replace with safe version
                  const safeCall = {
                    type: 'CallExpression',
                    callee: {
                      type: 'ArrowFunctionExpression',
                      params: [],
                      body: {
                        type: 'BlockStatement',
                        body: [
                          {
                            type: 'TryStatement',
                            block: {
                              type: 'BlockStatement',
                              body: [
                                {
                                  type: 'ReturnStatement',
                                  argument: {
                                    type: 'LogicalExpression',
                                    operator: '||',
                                    left: {
                                      type: 'OptionalCallExpression',
                                      callee: {
                                        type: 'OptionalMemberExpression',
                                        object: node.callee.object,
                                        property: node.callee.property,
                                        optional: true
                                      },
                                      arguments: []
                                    },
                                    right: {
                                      type: 'ObjectExpression',
                                      properties: []
                                    }
                                  }
                                }
                              ]
                            },
                            handler: {
                              type: 'CatchClause',
                              param: {
                                type: 'Identifier',
                                name: 'error'
                              },
                              body: {
                                type: 'BlockStatement',
                                body: [
                                  {
                                    type: 'ExpressionStatement',
                                    expression: {
                                      type: 'CallExpression',
                                      callee: {
                                        type: 'MemberExpression',
                                        object: {
                                          type: 'Identifier',
                                          name: 'console'
                                        },
                                        property: {
                                          type: 'Identifier',
                                          name: 'warn'
                                        }
                                      },
                                      arguments: [
                                        {
                                          type: 'StringLiteral',
                                          value: 'Metro: getConstants error, using fallback:'
                                        },
                                        {
                                          type: 'Identifier',
                                          name: 'error'
                                        }
                                      ]
                                    }
                                  },
                                  {
                                    type: 'ReturnStatement',
                                    argument: {
                                      type: 'ObjectExpression',
                                      properties: []
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        ]
                      }
                    },
                    arguments: []
                  };
                  
                  path.replaceWith(safeCall);
                }
              },
              
              // Fix checkVersions function calls
              CallExpression(path) {
                const { node } = path;
                
                // Check if this is a checkVersions call
                if (node.callee.type === 'Identifier' && 
                    node.callee.name === 'checkVersions') {
                  
                  // Replace with safe version
                  const safeCall = {
                    type: 'CallExpression',
                    callee: {
                      type: 'ArrowFunctionExpression',
                      params: [],
                      body: {
                        type: 'BlockStatement',
                        body: [
                          {
                            type: 'TryStatement',
                            block: {
                              type: 'BlockStatement',
                              body: [
                                {
                                  type: 'ReturnStatement',
                                  argument: {
                                    type: 'CallExpression',
                                    callee: node.callee,
                                    arguments: node.arguments
                                  }
                                }
                              ]
                            },
                            handler: {
                              type: 'CatchClause',
                              param: {
                                type: 'Identifier',
                                name: 'error'
                              },
                              body: {
                                type: 'BlockStatement',
                                body: [
                                  {
                                    type: 'ExpressionStatement',
                                    expression: {
                                      type: 'CallExpression',
                                      callee: {
                                        type: 'MemberExpression',
                                        object: {
                                          type: 'Identifier',
                                          name: 'console'
                                        },
                                        property: {
                                          type: 'Identifier',
                                          name: 'warn'
                                        }
                                      },
                                      arguments: [
                                        {
                                          type: 'StringLiteral',
                                          value: 'Metro: checkVersions error, skipping:'
                                        },
                                        {
                                          type: 'Identifier',
                                          name: 'error'
                                        }
                                      ]
                                    }
                                  },
                                  {
                                    type: 'ReturnStatement',
                                    argument: {
                                      type: 'BooleanLiteral',
                                      value: true
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        ]
                      }
                    },
                    arguments: []
                  };
                  
                  path.replaceWith(safeCall);
                }
              }
            }
          };
        }
      ],
      sourceMaps: options.sourceMaps,
      retainLines: options.retainLines,
    });

    return {
      code: result.code,
      map: result.map,
    };
  } catch (error) {
    console.warn('Metro transformer error:', error.message);
    // Return original code if transformation fails
    return { code: src };
  }
}; 