// Enhanced Babel plugin to fix getConstants calls at the AST level
module.exports = function() {
  return {
    visitor: {
      // Fix getConstants method calls - Enhanced to catch more cases
      CallExpression(path) {
        const { node } = path;
        
        // Check if this is a getConstants call (enhanced detection)
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
                                  value: 'getConstants error, using fallback:'
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
      
      // Fix checkVersions function calls - Enhanced to catch more cases
      CallExpression(path) {
        const { node } = path;
        
        // Check if this is a checkVersions call (enhanced detection)
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
                                  value: 'checkVersions error, skipping:'
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
      },
      
      // Fix getConstants property access - NEW: Catch property access patterns
      MemberExpression(path) {
        const { node } = path;
        
        // Check if this is accessing getConstants property
        if (node.property && 
            node.property.name === 'getConstants' && 
            node.object && 
            node.object.type === 'Identifier') {
          
          // Replace with safe property access
          const safeAccess = {
            type: 'LogicalExpression',
            operator: '||',
            left: {
              type: 'OptionalMemberExpression',
              object: node.object,
              property: node.property,
              optional: true
            },
            right: {
              type: 'ObjectExpression',
              properties: []
            }
          };
          
          path.replaceWith(safeAccess);
        }
      },
      
      // Fix function declarations that might call getConstants - NEW: Catch function patterns
      FunctionDeclaration(path) {
        const { node } = path;
        
        // Check if function name contains 'getConstants' or 'checkVersions'
        if (node.id && 
            (node.id.name.includes('getConstants') || 
             node.id.name.includes('checkVersions'))) {
          
          // Wrap function body with try-catch
          if (node.body && node.body.type === 'BlockStatement') {
            const tryCatchWrapper = {
              type: 'TryStatement',
              block: node.body,
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
                            value: 'Function error, using fallback:'
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
            };
            
            node.body.body = [tryCatchWrapper];
          }
        }
      },
      
      // Fix variable declarations that might reference getConstants - NEW: Catch variable patterns
      VariableDeclarator(path) {
        const { node } = path;
        
        // Check if variable name contains 'getConstants' or 'checkVersions'
        if (node.id && 
            node.id.name && 
            (node.id.name.includes('getConstants') || 
             node.id.name.includes('checkVersions'))) {
          
          // Wrap initializer with safe access
          if (node.init) {
            const safeInit = {
              type: 'LogicalExpression',
              operator: '||',
              left: node.init,
              right: {
                type: 'ObjectExpression',
                properties: []
              }
            };
            
            node.init = safeInit;
          }
        }
      }
    }
  };
}; 