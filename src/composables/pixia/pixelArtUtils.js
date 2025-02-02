export function isTransparent(color) {
  return color === "#ffffff00" || color === "#00000000";
}

export function hexToRgba(hex) {
  // Converts a hex code to RGBA format, handling both #RRGGBB and #RRGGBBAA formats.
  if (hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 1];
  } else if (hex.length === 9) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255;
    return [r, g, b, a];
  }
  return [255, 255, 255, 0]; // Transparent white as default
}

export function rgbaToHex([r, g, b, a]) {
  // Converts RGBA format back to hex, ensuring alpha is always 2 digits.
  const alpha = Math.round(a * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}${alpha.toString(16).padStart(2, "0")}`;
}

export function blendColors(baseColor, overlayColor) {
  const [r1, g1, b1, a1] = hexToRgba(baseColor);
  const [r2, g2, b2, a2] = hexToRgba(overlayColor);

  // Resulting alpha
  const a = a1 + a2 * (1 - a1);

  // Resulting color channels blended based on alpha
  const r = Math.round((r1 * a1 * (1 - a2) + r2 * a2) / a);
  const g = Math.round((g1 * a1 * (1 - a2) + g2 * a2) / a);
  const b = Math.round((b1 * a1 * (1 - a2) + b2 * a2) / a);

  return rgbaToHex([r, g, b, a]);
}

export function hexToHsla(hex) {
  // Remove the "#" if it exists
  hex = hex.replace("#", "");

  // Convert shorthand hex (e.g., #RGB) to full hex (e.g., #RRGGBB)
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Extract RGBA values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

  // Calculate HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
  }
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h: Math.round(h), s, l, a }; // Round hue to nearest integer
}

export function hslaToHex(h, s, l, a = 1) {
  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
  else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  a = Math.round(a * 255);

  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
  const alphaHex = a < 255 ? a.toString(16).padStart(2, "0") : "";

  return hex + alphaHex;
}
