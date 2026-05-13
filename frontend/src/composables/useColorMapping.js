export const getColorCode = (colorName) => {
  if (!colorName) return '#e0e0e0';
  const map = {
    'đỏ': '#cc1e2e', 'red': '#cc1e2e', 'đỏ đô': '#8b0000', 'đỏ mận': '#800000', 'đỏ tươi': '#ff0000', 'ruby': '#e0115f',
    'xanh': '#2e5b9f', 'blue': '#2e5b9f', 'xanh dương': '#007bff', 'xanh biển': '#1e90ff', 'xanh ngọc': '#009981', 'xanh lá': '#28a745', 'green': '#28a745', 'xanh lục': '#228b22', 'emerald': '#50c878',
    'vàng': '#e7ce7d', 'gold': '#e7ce7d', 'vàng 18k': '#d4af37', 'vàng 24k': '#ffd700', 'vàng chanh': '#fada5e', 'vàng kem': '#fdfd96',
    'trắng': '#ffffff', 'white': '#ffffff', 'vàng trắng': '#f4f4f4', 'bạch kim': '#e5e4e2', 'bạc': '#c0c0c0', 'silver': '#c0c0c0', 'trong suốt': '#f0f8ff',
    'đen': '#2c2c2c', 'black': '#2c2c2c', 'xám': '#808080', 'gray': '#808080', 'ghi': '#808080',
    'hồng': '#f4a4b4', 'pink': '#f4a4b4', 'vàng hồng': '#b76e79', 'rose gold': '#b76e79', 'tím': '#800080', 'purple': '#800080', 'thạch anh tím': '#9966cc',
    'nâu': '#8b4513', 'brown': '#8b4513', 'cam': '#fd7e14', 'orange': '#fd7e14'
  };
  return map[colorName.toLowerCase().trim()] || '#e0e0e0';
};

export const isLightColor = (colorName) => {
  const code = getColorCode(colorName);
  const lightCodes = ['#ffffff', '#fcfcfc', '#f4f4f4', '#e5e4e2', '#c0c0c0', '#e0e0e0', '#fada5e', '#fdfd96', '#f0f8ff', '#ffb6c1', '#f4a4b4'];
  return lightCodes.includes(code);
};

export const isColorAttribute = (name) => {
  const lowerName = name.toLowerCase();
  return lowerName.includes('màu') || lowerName.includes('color');
};

export const isSizeAttribute = (name) => {
  const lowerName = name.toLowerCase();
  return lowerName.includes('size') || lowerName.includes('kích cỡ') || lowerName.includes('cỡ') || lowerName.includes('ni tay');
};
