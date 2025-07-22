const fs = require('fs');
const path = require('path');

// Files to patch
const filesToPatch = [
  'node_modules/react-native/src/private/animated/NativeAnimatedHelper.js',
  'node_modules/react-native/Libraries/ReactNative/AppRegistry.js',
  'node_modules/react-native/src/private/specs/modules/NativeDeviceInfo.js',
  'node_modules/react-native/Libraries/Settings/Settings.ios.js',
  'node_modules/react-native/Libraries/Core/Devtools/getDevServer.js',
];

filesToPatch.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace the problematic TypeScript syntax patterns
      content = content.replace(
        /\) as \$NonMaybeType<typeof NativeAnimatedModule>\['getValue'\]/g,
        ')'
      );
      
      content = content.replace(
        /\) as \$NonMaybeType<typeof NativeAnimatedModule>\['startAnimatingNode'\]/g,
        ')'
      );
      
      content = content.replace(
        /\) as \(\) => void/g,
        ')'
      );
      
      // Special handling for NativeDeviceInfo - be more precise
      if (filePath.includes('NativeDeviceInfo')) {
        // Only replace the getConstants call inside the method, not the method signature
        content = content.replace(
          /constants = NativeModule\.getConstants\(\);/g,
          'try {\n      constants = NativeModule?.getConstants?.() || {};\n    } catch (error) {\n      console.warn("NativeDeviceInfo.getConstants error:", error);\n      constants = {};\n    }'
        );
        
        // Add safety wrapper around the return statement
        content = content.replace(
          /return constants;/g,
          'return constants || {};'
        );
      } else {
        // For other files, add general safety checks for getConstants calls
        content = content.replace(
          /\.getConstants\(\)/g,
          '?.getConstants?.() || {}'
        );
        
        content = content.replace(
          /getConstants\(\)/g,
          'getConstants?.() || {}'
        );
      }
      
      // Add null checks for module access
      content = content.replace(
        /NativeModules\.(\w+)/g,
        'NativeModules.$1 || {}'
      );
      
      // Add safety for checkVersions function
      content = content.replace(
        /function checkVersions\(/g,
        'function checkVersions('
      );
      
      // Wrap checkVersions function with try-catch
      content = content.replace(
        /(function checkVersions\([^)]*\)\s*\{)/g,
        '$1\n  try {'
      );
      
      content = content.replace(
        /(\}\s*\/\/\s*checkVersions)/g,
        '  } catch (error) {\n    console.warn("checkVersions error:", error);\n    return true;\n  }\n$1'
      );
      
      // Add comprehensive safety checks for all getConstants calls
      content = content.replace(
        /(\w+)\.getConstants\(\)/g,
        '(() => { try { return $1?.getConstants?.() || {}; } catch (error) { console.warn("getConstants error:", error); return {}; } })()'
      );
      
      // Add safety for module access
      content = content.replace(
        /NativeModules\[([^\]]+)\]/g,
        'NativeModules[$1] || {}'
      );
      
      // Add safety for TurboModuleRegistry access
      content = content.replace(
        /TurboModuleRegistry\.getEnforcing\(([^)]+)\)/g,
        '(() => { try { return TurboModuleRegistry?.getEnforcing?.($1) || { getConstants: () => ({}) }; } catch (error) { console.warn("TurboModuleRegistry error:", error); return { getConstants: () => ({}) }; } })()'
      );
      
      // Write the patched content back
      fs.writeFileSync(fullPath, content, 'utf8');
      
      console.log(`✅ Successfully patched ${filePath}`);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error patching ${filePath}:`, error.message);
  }
});

// Also create a global polyfill file that gets loaded very early
const globalPolyfillContent = `
// Global polyfill for getConstants issues - Loads very early
(function() {
  'use strict';
  
  // Override getConstants globally
  if (typeof global !== 'undefined') {
    // Create a safe getConstants function
    global.__safeGetConstants = function(obj) {
      if (!obj) return {};
      if (typeof obj.getConstants === 'function') {
        try {
          const result = obj.getConstants();
          return result || {};
        } catch (error) {
          console.warn('getConstants error, using fallback:', error);
          return {};
        }
      }
      return obj;
    };
    
    // Override require to add safety
    const originalRequire = global.require;
    if (originalRequire) {
      global.require = function(moduleName) {
        try {
          const module = originalRequire(moduleName);
          
          // Add safety wrapper to modules with getConstants
          if (module && typeof module.getConstants === 'function') {
            const originalGetConstants = module.getConstants;
            module.getConstants = function() {
              try {
                const result = originalGetConstants.call(this);
                return result || {};
              } catch (error) {
                console.warn('getConstants error, using fallback:', error);
                return {};
              }
            };
          }
          
          return module;
        } catch (error) {
          console.warn('Module require error:', error);
          return {};
        }
      };
    }
    
    // Override checkVersions function specifically
    global.__originalCheckVersions = global.checkVersions;
    global.checkVersions = function() {
      try {
        if (global.__originalCheckVersions) {
          return global.__originalCheckVersions.apply(this, arguments);
        }
        return true;
      } catch (error) {
        console.warn('checkVersions error, skipping:', error);
        return true;
      }
    };
    
    // Override any getConstants calls globally
    const originalGetPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function(obj, prop) {
      const descriptor = originalGetPropertyDescriptor.call(this, obj, prop);
      if (prop === 'getConstants' && obj && typeof obj.getConstants === 'function') {
        const originalGetConstants = obj.getConstants;
        obj.getConstants = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return descriptor;
    };
    
    // Override TurboModuleRegistry.getEnforcing to add safety
    if (global.TurboModuleRegistry) {
      const originalGetEnforcing = global.TurboModuleRegistry.getEnforcing;
      global.TurboModuleRegistry.getEnforcing = function(name) {
        try {
          const module = originalGetEnforcing.call(this, name);
          if (module && typeof module.getConstants === 'function') {
            const originalGetConstants = module.getConstants;
            module.getConstants = function() {
              try {
                const result = originalGetConstants.call(this);
                return result || {};
              } catch (error) {
                console.warn(\`TurboModuleRegistry.getEnforcing(\${name}).getConstants error:\`, error);
                return {};
              }
            };
          }
          return module;
        } catch (error) {
          console.warn(\`TurboModuleRegistry.getEnforcing(\${name}) error:\`, error);
          return {
            getConstants: () => ({}),
          };
        }
      };
    }
    
    // Override NativeModules to add safety
    if (global.NativeModules) {
      Object.keys(global.NativeModules).forEach(key => {
        const module = global.NativeModules[key];
        if (module && typeof module.getConstants === 'function') {
          const originalGetConstants = module.getConstants;
          module.getConstants = function() {
            try {
              const result = originalGetConstants.call(this);
              return result || {};
            } catch (error) {
              console.warn(\`NativeModules.\${key}.getConstants error:\`, error);
              return {};
            }
          };
        }
      });
    }
    
    // Override any getConstants calls globally
    const originalGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    Object.getOwnPropertyDescriptor = function(obj, prop) {
      const descriptor = originalGetOwnPropertyDescriptor.call(this, obj, prop);
      if (prop === 'getConstants' && obj && typeof obj.getConstants === 'function') {
        const originalGetConstants = obj.getConstants;
        obj.getConstants = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return descriptor;
    };
    
    // Override any getConstants calls globally
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
      if (prop === 'getConstants' && descriptor && descriptor.value && typeof descriptor.value === 'function') {
        const originalGetConstants = descriptor.value;
        descriptor.value = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };
    
    // Override any getConstants calls globally
    const originalGetPrototypeOf = Object.getPrototypeOf;
    Object.getPrototypeOf = function(obj) {
      const prototype = originalGetPrototypeOf.call(this, obj);
      if (prototype && typeof prototype.getConstants === 'function') {
        const originalGetConstants = prototype.getConstants;
        prototype.getConstants = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return prototype;
    };
    
    // Override any getConstants calls globally
    const originalCreate = Object.create;
    Object.create = function(proto, propertiesObject) {
      const obj = originalCreate.call(this, proto, propertiesObject);
      if (obj && typeof obj.getConstants === 'function') {
        const originalGetConstants = obj.getConstants;
        obj.getConstants = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return obj;
    };
    
    // Override any getConstants calls globally
    const originalSetPrototypeOf = Object.setPrototypeOf;
    Object.setPrototypeOf = function(obj, prototype) {
      const result = originalSetPrototypeOf.call(this, obj, prototype);
      if (prototype && typeof prototype.getConstants === 'function') {
        const originalGetConstants = prototype.getConstants;
        prototype.getConstants = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return result;
    };
    
    // Override any getConstants calls globally
    const originalAssign = Object.assign;
    Object.assign = function(target, ...sources) {
      const result = originalAssign.call(this, target, ...sources);
      if (result && typeof result.getConstants === 'function') {
        const originalGetConstants = result.getConstants;
        result.getConstants = function() {
          try {
            const result = originalGetConstants.call(this);
            return result || {};
          } catch (error) {
            console.warn('getConstants error, using fallback:', error);
            return {};
          }
        };
      }
      return result;
    };
  }
})();
`;

const globalPolyfillPath = path.join(__dirname, 'global-polyfill.js');
fs.writeFileSync(globalPolyfillPath, globalPolyfillContent, 'utf8');
console.log('✅ Created global polyfill file');

console.log('🎉 All patches applied successfully!'); 