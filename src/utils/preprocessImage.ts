type DrawableSource = {
  width: number;
  height: number;
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup?: () => void;
};

async function createDrawableFromFile(image: File): Promise<DrawableSource | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(image);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (context, width, height) => context.drawImage(bitmap, 0, 0, width, height),
        cleanup: () => bitmap.close(),
      };
    } catch (error) {
      console.warn("createImageBitmap failed, trying image element fallback", error);
    }
  }

  return new Promise<DrawableSource | null>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        draw: (context, width, height) => context.drawImage(img, 0, 0, width, height),
      });
    };
    img.onerror = (err) => reject(err);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        img.src = reader.result;
      } else {
        reject(new Error("Unable to read image data"));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(image);
  }).catch((error) => {
    console.error("Failed to create drawable source", error);
    return null;
  });
}

export async function preprocessImageForOCR(image: File): Promise<File | Blob> {
  if (typeof window === "undefined") {
    return image;
  }

  try {
    const drawable = await createDrawableFromFile(image);
    if (!drawable) {
      return image;
    }

    const MAX_DIMENSION = 2200;
    const largestSide = Math.max(drawable.width, drawable.height);
    const scale = largestSide > MAX_DIMENSION ? MAX_DIMENSION / largestSide : 1;
    const targetWidth = Math.round(drawable.width * scale);
    const targetHeight = Math.round(drawable.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      drawable.cleanup?.();
      return image;
    }

    drawable.draw(context, targetWidth, targetHeight);
    drawable.cleanup?.();

    const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
      const contrasted = Math.min(255, Math.max(0, (grayscale - 128) * 1.2 + 128));
      const threshold = contrasted > 200 ? 255 : contrasted < 60 ? 0 : contrasted;

      data[i] = threshold;
      data[i + 1] = threshold;
      data[i + 2] = threshold;
    }

    context.putImageData(imageData, 0, 0);

    const processed = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1);
    });

    if (!processed) {
      return image;
    }

    return new File([processed], `${image.name.replace(/\.[^.]+$/, "")}-enhanced.png`, {
      type: "image/png",
    });
  } catch (error) {
    console.error("Failed to preprocess image", error);
    return image;
  }
}
