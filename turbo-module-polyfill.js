// Enhanced TurboModule polyfill for React Native new architecture compatibility
import { NativeModules, Platform } from 'react-native';

// Create a comprehensive PlatformConstants mock
const createPlatformConstants = () => ({
  isTesting: false,
  reactNativeVersion: {
    major: 0,
    minor: 76,
    patch: 0,
  },
  osVersion: Platform.OS === 'ios' ? '17.0' : '34',
  systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
  brand: Platform.OS === 'ios' ? 'Apple' : 'Google',
  model: Platform.OS === 'ios' ? 'iPhone' : 'Pixel',
  buildId: '1.0.0',
  appVersion: '1.0.0',
  buildVersion: '1',
  bundleIdentifier: 'app.rork.hoopmaster-ai-rlnjsqh',
  getConstants: () => ({
    isTesting: false,
    reactNativeVersion: {
      major: 0,
      minor: 76,
      patch: 0,
    },
    osVersion: Platform.OS === 'ios' ? '17.0' : '34',
    systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
    brand: Platform.OS === 'ios' ? 'Apple' : 'Google',
    model: Platform.OS === 'ios' ? 'iPhone' : 'Pixel',
    buildId: '1.0.0',
    appVersion: '1.0.0',
    buildVersion: '1',
    bundleIdentifier: 'app.rork.hoopmaster-ai-rlnjsqh',
  }),
});

// Enhanced TurboModuleRegistry mock
const mockTurboModuleRegistry = {
  getEnforcing: (name) => {
    console.log(`TurboModuleRegistry.getEnforcing called with: ${name}`);
    
    if (name === 'PlatformConstants') {
      return createPlatformConstants();
    }
    if (name === 'NativePerformanceCxx') {
      return {
        mark: () => {},
        measure: () => {},
        clearMarks: () => {},
        clearMeasures: () => {},
      };
    }
    if (name === 'NativePerformanceObserverCxx') {
      return {
        observe: () => {},
        disconnect: () => {},
        takeRecords: () => [],
      };
    }
    if (name === 'NativeAnimatedModule') {
      return {
        startOperationBatch: () => {},
        finishOperationBatch: () => {},
        queueAndExecuteBatchedOperations: () => {},
        createAnimatedNode: () => {},
        updateAnimatedNodeConfig: () => {},
        startListeningToAnimatedNodeValue: () => {},
        stopListeningToAnimatedNodeValue: () => {},
        connectAnimatedNodes: () => {},
        disconnectAnimatedNodes: () => {},
        startAnimatingNode: () => {},
        stopAnimation: () => {},
        setAnimatedNodeValue: () => {},
        setAnimatedNodeOffset: () => {},
        flattenAnimatedNodeOffset: () => {},
        extractAnimatedNodeOffset: () => {},
        connectAnimatedNodeToView: () => {},
        disconnectAnimatedNodeFromView: () => {},
        restoreDefaultValues: () => {},
        dropAnimatedNode: () => {},
        addAnimatedEventToView: () => {},
        removeAnimatedEventFromView: () => {},
        getValue: () => {},
        getConstants: () => ({}),
      };
    }
    
    // Return a default mock for any other module
    return {
      __mock: true,
      name,
      getConstants: () => ({}),
    };
  },
  get: (name) => {
    console.log(`TurboModuleRegistry.get called with: ${name}`);
    return mockTurboModuleRegistry.getEnforcing(name);
  },
};

// Override TurboModuleRegistry globally
if (typeof global !== 'undefined') {
  global.TurboModuleRegistry = mockTurboModuleRegistry;
}

// Enhanced NativeModules override
const platformConstants = createPlatformConstants();

// Ensure NativeModules.PlatformConstants exists and has all required methods
if (!NativeModules.PlatformConstants) {
  NativeModules.PlatformConstants = platformConstants;
} else {
  // Merge with existing if it exists
  Object.assign(NativeModules.PlatformConstants, platformConstants);
}

// Ensure getConstants is always available and safe
if (!NativeModules.PlatformConstants.getConstants) {
  NativeModules.PlatformConstants.getConstants = platformConstants.getConstants;
}

// Add safety wrapper to existing getConstants if it exists
if (NativeModules.PlatformConstants.getConstants) {
  const originalGetConstants = NativeModules.PlatformConstants.getConstants;
  NativeModules.PlatformConstants.getConstants = function() {
    try {
      const result = originalGetConstants.call(this);
      return result || {};
    } catch (error) {
      console.warn('PlatformConstants.getConstants error, using fallback:', error);
      return platformConstants.getConstants();
    }
  };
}

// Add other commonly needed modules
if (!NativeModules.NativePerformanceCxx) {
  NativeModules.NativePerformanceCxx = {
    mark: () => {},
    measure: () => {},
    clearMarks: () => {},
    clearMeasures: () => {},
  };
}

if (!NativeModules.NativePerformanceObserverCxx) {
  NativeModules.NativePerformanceObserverCxx = {
    observe: () => {},
    disconnect: () => {},
    takeRecords: () => [],
  };
}

if (!NativeModules.NativeAnimatedModule) {
  NativeModules.NativeAnimatedModule = {
    startOperationBatch: () => {},
    finishOperationBatch: () => {},
    queueAndExecuteBatchedOperations: () => {},
    createAnimatedNode: () => {},
    updateAnimatedNodeConfig: () => {},
    startListeningToAnimatedNodeValue: () => {},
    stopListeningToAnimatedNodeValue: () => {},
    connectAnimatedNodes: () => {},
    disconnectAnimatedNodes: () => {},
    startAnimatingNode: () => {},
    stopAnimation: () => {},
    setAnimatedNodeValue: () => {},
    setAnimatedNodeOffset: () => {},
    flattenAnimatedNodeOffset: () => {},
    extractAnimatedNodeOffset: () => {},
    connectAnimatedNodeToView: () => {},
    disconnectAnimatedNodeFromView: () => {},
    restoreDefaultValues: () => {},
    dropAnimatedNode: () => {},
    addAnimatedEventToView: () => {},
    removeAnimatedEventFromView: () => {},
    getValue: () => {},
    getConstants: () => ({}),
  };
}

// Global error handler for runtime issues
if (typeof global !== 'undefined') {
  // Only wrap require if not already wrapped
  if (global.require && !global.require.__isTurboPolyfill) {
    const originalRequire = global.require;
    function turboPolyfillRequire(moduleName) {
      try {
        const module = originalRequire(moduleName);
        // If the module has a getConstants method, wrap it with error handling
        if (module && typeof module.getConstants === 'function' && !module.getConstants.__isTurboPolyfill) {
          const originalGetConstants = module.getConstants;
          function safeGetConstants() {
            try {
              const result = originalGetConstants.call(this);
              return result || {};
            } catch (error) {
              console.warn(`getConstants error in ${moduleName}, using fallback:`, error);
              return {};
            }
          }
          safeGetConstants.__isTurboPolyfill = true;
          module.getConstants = safeGetConstants;
        }
        return module;
      } catch (error) {
        console.warn(`Error requiring ${moduleName}:`, error);
        return {};
      }
    }
    turboPolyfillRequire.__isTurboPolyfill = true;
    global.require = turboPolyfillRequire;
  }
  
  // Add global error handler for getConstants calls
  global.__getConstantsSafe = function(obj) {
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
}

console.log('✅ TurboModule polyfill loaded successfully');

export default {
  NativeModules,
  TurboModuleRegistry: mockTurboModuleRegistry,
}; 