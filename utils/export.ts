export async function getCroppedImageAsJpeg(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  outputSize = 600
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw cropped region to output canvas
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  // Try to fit under 240KB by reducing quality progressively
  let quality = 0.92;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);
  const maxBytes = 240 * 1024;
  let attempts = 0;
  while (blob.size > maxBytes && attempts < 8) {
    quality = Math.max(0.5, quality - 0.07);
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
    attempts++;
  }
  return blob;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), type, quality));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function bytesToKB(bytes: number): number {
  return Math.round(bytes / 102.4) / 10; // one decimal
}

