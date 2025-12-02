import { ThemeName, ThemeColors } from '../types';

// Theme presets based on cat fur colors
export const themes: Record<ThemeName, ThemeColors & { name: string; description: string; catType: string }> = {
  'warm-amber': {
    name: 'Warm Amber',
    description: 'Cozy, friendly, safe — perfect for orange and warm-colored cats',
    catType: 'Warm Tones',
    primary: '#F4CDA5',
    secondary: '#D1A27B',
    background: '#FFF5ED',
    text: '#3B2E25',
    textSecondary: '#3B2E25',
    muted: '#E8D8C8',
  },
  'soft-cream-neutral': {
    name: 'Soft Cream Neutral',
    description: 'Very soft and light — ideal for slow living and relaxation',
    catType: 'Neutral Tones',
    primary: '#F8F1E7',
    secondary: '#D7C5A8',
    background: '#FFFFFF',
    text: '#463730',
    textSecondary: '#6A4E3A',
    muted: '#E8D8C8',
  },
  'frosted-taupe': {
    name: 'Frosted Taupe',
    description: 'Sophisticated and refined — for science-focused health monitoring',
    catType: 'Cool Neutrals',
    primary: '#CFC6BC',
    secondary: '#ABA39A',
    background: '#F6F3F0',
    text: '#2F2823',
    textSecondary: '#59534D',
    muted: '#D7CCBF',
  },
  'nutmeg-sand': {
    name: 'Nutmeg & Sand',
    description: 'Warm, stable, and earthy — natural and grounding',
    catType: 'Brown / Earthy',
    primary: '#C79E74',
    secondary: '#A87C58',
    background: '#FFF5ED',
    text: '#3B2E25',
    textSecondary: '#3B2E25',
    muted: '#E8D8C8',
  },
};

// Extract dominant color from image
export const extractDominantColor = (imageUrl: string): Promise<{ r: number; g: number; b: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Resize for performance
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      
      ctx.drawImage(img, 0, 0, size, size);
      
      try {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Sample every 4th pixel for performance
        for (let i = 0; i < data.length; i += 16) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        resolve({
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count),
        });
      } catch (error) {
        // If canvas is tainted (CORS), use default
        resolve({ r: 244, g: 205, b: 165 });
      }
    };
    
    img.onerror = () => {
      // Fallback to default color
      resolve({ r: 244, g: 205, b: 165 });
    };
    
    img.src = imageUrl;
  });
};

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
};

// Detect theme based on dominant color
export const detectThemeFromColor = (rgb: { r: number; g: number; b: number }): ThemeName => {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Very dark colors (black cats)
  if (hsl.l < 30) {
    return 'midnight-neutral';
  }
  
  // Very light/desaturated colors (white/grey cats)
  if (hsl.s < 20 && hsl.l > 65) {
    return 'misty-grey';
  }
  
  // Warm orange tones (orange cats)
  if (hsl.h >= 20 && hsl.h <= 40 && hsl.s > 30) {
    return 'ginger-cat';
  }
  
  // Default fallback (Warm Amber)
  return 'warm-amber';
};

// Get theme from image URL
export const detectThemeFromImage = async (imageUrl: string): Promise<ThemeName> => {
  try {
    const dominantColor = await extractDominantColor(imageUrl);
    return detectThemeFromColor(dominantColor);
  } catch (error) {
    console.error('Error detecting theme:', error);
    return 'warm-amber';
  }
};

// Get all available themes for selection
export const getAvailableThemes = (): Array<{ id: ThemeName; name: string; description: string; catType: string }> => {
  return Object.entries(themes).map(([id, theme]) => ({
    id: id as ThemeName,
    name: theme.name,
    description: theme.description,
    catType: theme.catType,
  }));
};

// Apply theme to CSS variables
export const applyTheme = (themeName: ThemeName) => {
  // Fallback to warm-amber if theme doesn't exist
  const theme = themes[themeName] || themes['warm-amber'];
  
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--secondary', theme.secondary);
  document.documentElement.style.setProperty('--background', theme.background);
  document.documentElement.style.setProperty('--foreground', theme.text);
  document.documentElement.style.setProperty('--muted', theme.muted);
  document.documentElement.style.setProperty('--muted-foreground', theme.textSecondary);
  document.documentElement.style.setProperty('--accent', theme.primary);
  document.documentElement.style.setProperty('--card', theme.background);
};
