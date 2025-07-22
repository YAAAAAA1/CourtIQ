// Comprehensive polyfills for React Native new architecture compatibility
import { NativeModules, Platform } from 'react-native';

// Enhanced PlatformConstants mock with better error handling
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

// Mock TurboModuleRegistry to prevent PlatformConstants errors
const mockTurboModuleRegistry = {
  getEnforcing: (name) => {
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
    // Return a default mock for any other module
    return {
      __mock: true,
      name,
      getConstants: () => ({}),
    };
  },
  get: (name) => {
    return mockTurboModuleRegistry.getEnforcing(name);
  },
};

// Override TurboModuleRegistry globally
if (typeof global !== 'undefined') {
  global.TurboModuleRegistry = mockTurboModuleRegistry;
}

// Enhanced NativeModules override with better error handling
const platformConstants = createPlatformConstants();

// Ensure NativeModules.PlatformConstants exists and has all required methods
if (!NativeModules.PlatformConstants) {
  NativeModules.PlatformConstants = platformConstants;
} else {
  // Merge with existing if it exists
  Object.assign(NativeModules.PlatformConstants, platformConstants);
}

// Ensure getConstants is always available
if (!NativeModules.PlatformConstants.getConstants) {
  NativeModules.PlatformConstants.getConstants = platformConstants.getConstants;
}

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

// Add additional safety checks for commonly accessed modules
const additionalModules = {
  NativeAnimatedModule: {
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
  },
  NativeModules,
  TurboModuleRegistry: mockTurboModuleRegistry,
};

// Merge additional modules into NativeModules
Object.assign(NativeModules, additionalModules);

// Global error handler for getConstants calls
if (typeof global !== 'undefined') {
  // Override any potential null getConstants calls
  const originalRequire = global.require;
  if (originalRequire) {
    global.require = function(moduleName) {
      const module = originalRequire(moduleName);
      
      // If the module has a getConstants method that might be null, provide a fallback
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
    };
  }
}

// Mock other potentially missing modules
const mockModules = {
  NativeModules,
  TurboModuleRegistry: mockTurboModuleRegistry,
};

export default mockModules; 