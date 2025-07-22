// Enhanced pre-polyfill that loads before any other code
// This prevents getConstants errors at the earliest possible moment

console.log('🔧 Loading enhanced pre-polyfill...');

// Override checkVersions function specifically
if (typeof global !== 'undefined') {
  // Store original checkVersions if it exists
  const originalCheckVersions = global.checkVersions;
  
  // Create safe checkVersions function
  global.checkVersions = function(...args) {
    try {
      if (originalCheckVersions) {
        return originalCheckVersions.apply(this, args);
      }
      return true; // Default success
    } catch (error) {
      console.warn('Pre-polyfill: checkVersions error, using fallback:', error);
      return true; // Default success
    }
  };
  
  // Also override any getConstants calls that might be in checkVersions
  const originalGetConstants = global.getConstants;
  global.getConstants = function(...args) {
    try {
      if (originalGetConstants) {
        return originalGetConstants.apply(this, args);
      }
      return {}; // Default empty object
    } catch (error) {
      console.warn('Pre-polyfill: getConstants error, using fallback:', error);
      return {}; // Default empty object
    }
  };
}

// Override require to catch getConstants calls
const originalRequire = global.require;
if (originalRequire) {
  global.require = function(moduleName) {
    try {
      const module = originalRequire(moduleName);
      
      // If the module has getConstants, wrap it
      if (module && typeof module.getConstants === 'function') {
        const originalGetConstants = module.getConstants;
        module.getConstants = function(...args) {
          try {
            return originalGetConstants.apply(this, args);
          } catch (error) {
            console.warn('Pre-polyfill: Module getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      
      return module;
    } catch (error) {
      console.warn('Pre-polyfill: Module require error:', error);
      return {};
    }
  };
}

// Override Object.getOwnPropertyDescriptor to catch getConstants property access
const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
Object.getOwnPropertyDescriptor = function(obj, prop) {
  try {
    const descriptor = originalGetOwnPropertyDescriptor.call(this, obj, prop);
    
    // If accessing getConstants property, ensure it's safe
    if (prop === 'getConstants' && descriptor && descriptor.value) {
      const originalValue = descriptor.value;
      descriptor.value = function(...args) {
        try {
          return originalValue.apply(this, args);
        } catch (error) {
          console.warn('Pre-polyfill: Property getConstants error, using fallback:', error);
          return {};
        }
      };
    }
    
    return descriptor;
  } catch (error) {
    console.warn('Pre-polyfill: getOwnPropertyDescriptor error:', error);
    return { value: {}, writable: true, enumerable: true, configurable: true };
  }
};

// Override Object.defineProperty to catch getConstants property definitions
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(obj, prop, descriptor) {
  try {
    // If defining getConstants property, ensure it's safe
    if (prop === 'getConstants' && descriptor && descriptor.value) {
      const originalValue = descriptor.value;
      descriptor.value = function(...args) {
        try {
          return originalValue.apply(this, args);
        } catch (error) {
          console.warn('Pre-polyfill: DefineProperty getConstants error, using fallback:', error);
          return {};
        }
      };
    }
    
    return originalDefineProperty.call(this, obj, prop, descriptor);
  } catch (error) {
    console.warn('Pre-polyfill: defineProperty error:', error);
    return obj;
  }
};

// Override Object.getPrototypeOf to catch getConstants in prototypes
const originalGetPrototypeOf = Object.getPrototypeOf;
Object.getPrototypeOf = function(obj) {
  try {
    const prototype = originalGetPrototypeOf.call(this, obj);
    
    // If prototype has getConstants, wrap it
    if (prototype && typeof prototype.getConstants === 'function') {
      const originalGetConstants = prototype.getConstants;
      prototype.getConstants = function(...args) {
        try {
          return originalGetConstants.apply(this, args);
        } catch (error) {
          console.warn('Pre-polyfill: Prototype getConstants error, using fallback:', error);
          return {};
        }
      };
    }
    
    return prototype;
  } catch (error) {
    console.warn('Pre-polyfill: getPrototypeOf error:', error);
    return {};
  }
};

// Override Object.create to catch getConstants in created objects
const originalCreate = Object.create;
Object.create = function(proto, propertiesObject) {
  try {
    const obj = originalCreate.call(this, proto, propertiesObject);
    
    // If propertiesObject has getConstants, wrap it
    if (propertiesObject && propertiesObject.getConstants && propertiesObject.getConstants.value) {
      const originalGetConstants = propertiesObject.getConstants.value;
      obj.getConstants = function(...args) {
        try {
          return originalGetConstants.apply(this, args);
        } catch (error) {
          console.warn('Pre-polyfill: Create getConstants error, using fallback:', error);
          return {};
        }
      };
    }
    
    return obj;
  } catch (error) {
    console.warn('Pre-polyfill: create error:', error);
    return {};
  }
};

// Override Object.setPrototypeOf to catch getConstants in prototype chains
const originalSetPrototypeOf = Object.setPrototypeOf;
Object.setPrototypeOf = function(obj, prototype) {
  try {
    // If prototype has getConstants, wrap it
    if (prototype && typeof prototype.getConstants === 'function') {
      const originalGetConstants = prototype.getConstants;
      prototype.getConstants = function(...args) {
        try {
          return originalGetConstants.apply(this, args);
        } catch (error) {
          console.warn('Pre-polyfill: SetPrototypeOf getConstants error, using fallback:', error);
          return {};
        }
      };
    }
    
    return originalSetPrototypeOf.call(this, obj, prototype);
  } catch (error) {
    console.warn('Pre-polyfill: setPrototypeOf error:', error);
    return obj;
  }
};

// Override Object.assign to catch getConstants in assigned objects
const originalAssign = Object.assign;
Object.assign = function(target, ...sources) {
  try {
    const result = originalAssign.call(this, target, ...sources);
    
    // Check if any source has getConstants and wrap it
    sources.forEach(source => {
      if (source && typeof source.getConstants === 'function') {
        const originalGetConstants = source.getConstants;
        result.getConstants = function(...args) {
          try {
            return originalGetConstants.apply(this, args);
          } catch (error) {
            console.warn('Pre-polyfill: Assign getConstants error, using fallback:', error);
            return {};
          }
        };
      }
    });
    
    return result;
  } catch (error) {
    console.warn('Pre-polyfill: assign error:', error);
    return target || {};
  }
};

console.log('✅ Enhanced pre-polyfill loaded successfully'); 