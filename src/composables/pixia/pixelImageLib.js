import { rgbaToHex } from "./pixelArtUtils";

// Finish selection
export function getSelectedArea(
  selectionStart,
  selectionEnd,
  width,
  canvasPixel
) {
  const startX = Math.min(selectionStart.x, selectionEnd.x);
  const startY = Math.min(selectionStart.y, selectionEnd.y);
  const endX = Math.max(selectionStart.x, selectionEnd.x);
  const endY = Math.max(selectionStart.y, selectionEnd.y);
  let selectedArea = [];
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const index = y * width + x;
      selectedArea.push({ index, ...canvasPixel[index] });
    }
  }
  return selectedArea;
  // console.log(selectedArea, selectionStart, selectionEnd);
}

export function moveSelectedArea(
  newX,
  newY,
  selectionStart,
  selectedArea,
  size,
  canvasPixel
) {
  if (!selectedArea.length) return;

  const dx = newX - selectionStart.x;
  const dy = newY - selectionStart.y;
  const newCanvas = [...canvasPixel];
  const newPositions = new Map();

  selectedArea.forEach(({ index, color }) => {
    const oldX = index % size.width;
    const oldY = Math.floor(index / size.width);

    const newX = oldX + dx;
    const newY = oldY + dy;
    if (newX >= 0 && newX < size.width && newY >= 0 && newY < size.height) {
      const newIndex = newY * size.width + newX;
      newPositions.set(newIndex, { color });
    }
    newCanvas[index] = { color: "#00000000" };
  });
  newPositions.forEach((data, index) => {
    newCanvas[index] = data;
  });
  return newCanvas;
}

export function getPreviewPNG(pixelea, width = 16, height = 16) {
  // Create a canvas for exporting at 16x16
  const canvas = document.createElement("canvas");
  canvas.width = width; // 16 pixels
  canvas.height = height; // 16 pixels
  const ctx = canvas.getContext("2d");

  pixelea.forEach((pixel, index) => {
    const x = index % width; // 1 pixel size
    const y = Math.floor(index / width); // 1 pixel size
    ctx.fillStyle = pixel.color;
    ctx.fillRect(x, y, 1, 1); // Draw each pixel as 1x1
  });

  return canvas.toDataURL("image/png");
}

export function exportAsPNG(
  pixels,
  width = 16,
  height = 16,
  name = "pixel-art"
) {
  // Create a canvas for exporting at 16x16
  const canvas = document.createElement("canvas");
  canvas.width = width; // 16 pixels
  canvas.height = height; // 16 pixels
  const ctx = canvas.getContext("2d");

  pixels.forEach((pixel, index) => {
    const x = index % width; // 1 pixel size
    const y = Math.floor(index / width); // 1 pixel size
    ctx.fillStyle = pixel.color;
    ctx.fillRect(x, y, 1, 1); // Draw each pixel as 1x1
  });

  // Export the canvas as a PNG file
  const link = document.createElement("a");
  link.download = `${name}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export function convertImageToJson(file, size = { width: 24, height: 24 }) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file provided"));

    const img = new Image();
    img.src = typeof file === "string" ? file : URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, size.width, size.height);

      const imageData = ctx.getImageData(0, 0, size.width, size.height).data;

      // Create JSON representation of the image
      const json = Array.from({ length: size.width * size.height }, (_, i) => {
        const index = i * 4; // Each pixel has 4 values: R, G, B, A
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const a = imageData[index + 3] / 255; // Normalize alpha to 0-1
        return { color: rgbaToHex([r, g, b, a]) };
      });

      resolve(json);
    };

    img.onerror = () => reject(new Error("Failed to load the image"));
  });
}

// function exportAsPNG() {
//   const canvas = document.createElement("canvas");
//   canvas.width = width * 16;
//   canvas.height = height * 16;
//   const ctx = canvas.getContext("2d");

//   if (!isTransparent(backgroundColor.value)) {
//     ctx.fillStyle = backgroundColor.value;
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   }

//   pixels.value.forEach((pixel, index) => {
//     const x = (index % width) * 16;
//     const y = Math.floor(index / width) * 16;
//     ctx.fillStyle = pixel.color;
//     ctx.fillRect(x, y, 16, 16);
//   });

//   const link = document.createElement("a");
//   link.download = "pixel-art.png";
//   link.href = canvas.toDataURL("image/png");
//   link.click();
// }
