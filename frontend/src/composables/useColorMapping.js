import clientApiClient from '@/utils/clientApiClient';

let colorDictionary = null;
let isFetching = false;
let fetchPromise = null;

export const fetchColorDictionary = async () => {
    if (colorDictionary !== null) return colorDictionary;
    if (isFetching) return fetchPromise;

    isFetching = true;
    fetchPromise = (async () => {
        try {
            // Dùng clientApiClient để gọi public route
            const res = await clientApiClient.get('/color-dictionaries');
            colorDictionary = res.data || [];
            return colorDictionary;
        } catch (e) {
            console.error("Failed to load color dictionary", e);
            colorDictionary = []; // Fallback empty array
            return [];
        } finally {
            isFetching = false;
        }
    })();
    return fetchPromise;
};

// Normalize name (lowercase, no accents)
export const normalizeAttributeName = (name) => String(name || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/-/g, ' ')
  .trim();

export const getColorCode = (colorName) => {
  if (!colorName || !colorDictionary) return null;
  
  const normalizedSearch = normalizeAttributeName(colorName);
  
  // Tìm trong DB map
  const found = colorDictionary.find(c => 
      c.normalized_name === normalizedSearch || 
      normalizeAttributeName(c.name) === normalizedSearch
  );
  
  if (found) return found.color_code;
  
  // Fallback support for English names or direct HEX if user types hex directly
  if (colorName.startsWith('#')) return colorName;
  
  return null; // Return null to trigger Text Label fallback
};

export const isLightColor = (colorName) => {
  const code = getColorCode(colorName);
  if (!code) return false;
  
  const lightCodes = ['#ffffff', '#fcfcfc', '#f4f4f4', '#e5e4e2', '#c0c0c0', '#e0e0e0', '#fada5e', '#fdfd96', '#f0f8ff', '#ffb6c1', '#f4a4b4'];
  
  // If it's explicitly one of our known light colors
  if (lightCodes.includes(code.toLowerCase())) return true;
  
  // Basic Hex brightness calculation fallback
  if (code.startsWith('#') && (code.length === 7 || code.length === 4)) {
      let r, g, b;
      if (code.length === 4) {
          r = parseInt(code[1]+code[1], 16);
          g = parseInt(code[2]+code[2], 16);
          b = parseInt(code[3]+code[3], 16);
      } else {
          r = parseInt(code.substring(1,3), 16);
          g = parseInt(code.substring(3,5), 16);
          b = parseInt(code.substring(5,7), 16);
      }
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 200; 
  }
  
  return false;
};

export const isColorAttribute = (name) => {
  const lowerName = normalizeAttributeName(name);
  return lowerName.includes('mau') || lowerName.includes('color');
};

export const isSizeAttribute = (name) => {
  const lowerName = normalizeAttributeName(name);
  return lowerName.includes('size') || lowerName.includes('kich co') || /\bco\b/.test(lowerName) || lowerName.includes('ni tay');
};
