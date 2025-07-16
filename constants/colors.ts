const colors = {
    // Primary brand colors with gradients
    primary: "#FF6B35", // Vibrant orange
    primaryLight: "#FF8A5B",
    primaryDark: "#E55A2B",
    primaryGradient: ["#FF6B35", "#FF8A5B"] as const,
    
    // Secondary colors
    secondary: "#1A1A1A", // Rich dark
    secondaryLight: "#2A2A2A",
    secondaryDark: "#0F0F0F",
    secondaryGradient: ["#1A1A1A", "#2A2A2A"] as const,
    
    // Background colors
    background: "#000000",
    backgroundLight: "#111111",
    backgroundCard: "#1C1C1E",
    backgroundGradient: ["#000000", "#111111"] as const,
    
    // Text colors - better contrast
    text: "#FFFFFF",
    textSecondary: "#A1A1A6",
    textTertiary: "#8E8E93",
    textInverse: "#000000",
    textOnLight: "#1A1A1A", // Dark text for light backgrounds
    
    // Status colors - all orange shades
    success: "#FF8A5B", // Orange success
    successLight: "#FFA07A",
    error: "#FF4500", // Orange red
    errorLight: "#FF6347",
    warning: "#FFA500", // Orange warning
    warningLight: "#FFB84D",
    info: "#FF7F50", // Coral orange
    infoLight: "#FF9966",
    
    // Light theme colors for compatibility
    light: {
      tint: "#FF6B35",
      text: "#1A1A1A", // Dark text for light backgrounds
      tabIconDefault: "#A1A1A6",
      tabIconSelected: "#FF6B35",
    },
    
    // Accent colors for sports theme - orange variations
    accent: {
      blue: "#FF7F50", // Coral
      purple: "#FF6347", // Tomato
      pink: "#FF69B4", // Hot pink (keeping this one)
      green: "#FF8C00", // Dark orange
      yellow: "#FFA500", // Orange
      red: "#FF4500", // Orange red
    },
    
    // Gray scale
    gray: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    
    // Utility colors
    transparent: "transparent",
    overlay: "rgba(0, 0, 0, 0.6)",
    overlayLight: "rgba(0, 0, 0, 0.3)",
    overlayDark: "rgba(0, 0, 0, 0.8)",
    
    // Card specific colors with gradients - orange theme
    card: {
      nutrition: "#FFA500",
      nutritionGradient: ["#FFA500", "#FFB84D"] as const,
      workout: "#FF6B35", 
      workoutGradient: ["#FF6B35", "#FF8A5B"] as const,
      time: "#FF7F50",
      timeGradient: ["#FF7F50", "#FF9966"] as const,
      analytics: "#FF8C00",
      analyticsGradient: ["#FF8C00", "#FFA500"] as const,
    },
    
    // Shadow colors
    shadow: {
      light: "rgba(255, 255, 255, 0.1)",
      dark: "rgba(0, 0, 0, 0.3)",
      colored: "rgba(255, 107, 53, 0.3)",
    }
  };
  
  export default colors;