/**
 * Loads a image source and extracts the ImageData.
 * The caller needs to clean up the src (if its an object url)!
 * @param src Image source. Can be a base64 string or a string to a resource URL.
 */
function convertImgSrcToImageData(src: string): Promise<ImageData> {
  return new Promise<ImageData>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
      if (canvasContext == null) {
        reject(
          new Error(
            'Canvas context for conversion from Base64 to ImageData could not be created.'
          )
        );
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      canvasContext.drawImage(img, 0, 0);
      const imageData = canvasContext.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
      canvas.remove();
      resolve(imageData);
    };
    img.onerror = (err) => {
      console.error(err);
      reject(
        new Error(
          'Could not load the image for conversion. If the image is in base64 format, it should include "data:image;base64,"?\n'
        )
      );
    };
    img.src = src;
  });
}

export function transformBase64ToBlob(base64: string): Promise<Blob> {
  return fetch(base64).then((res) => res.blob());
}

/**
 * The given base64 string needs to start with "data:image;base64,"
 * Can throw errors.
 * @param base64
 */
export function transformBase64ToImageData(base64: string): Promise<ImageData> {
  return convertImgSrcToImageData(base64);
}

export function transformBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result === null || typeof reader.result !== 'string') {
        reject(new Error('Could not convert Blob to Base64!'));
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function transformBlobToImageData(blob: Blob): Promise<ImageData> {
  const objUrl = URL.createObjectURL(blob);
  const result = await convertImgSrcToImageData(objUrl);
  URL.revokeObjectURL(objUrl);
  return result;
}

export function transformImageDataToBase64(
  imageData: ImageData
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    if (canvasContext == null) {
      reject(
        new Error(
          'Could not get canvas context for conversion from ImageData to Base64.'
        )
      );
      return;
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvasContext.putImageData(imageData, 0, 0);

    const result = canvas.toDataURL();
    canvas.remove();
    resolve(result);
  });
}

export function transformImageDataToBlob(imageData: ImageData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    if (canvasContext == null) {
      reject(
        new Error(
          'Could not get canvas context for conversion from ImageData to Blob.'
        )
      );
      return;
    }

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvasContext.putImageData(imageData, 0, 0);

    canvas.toBlob((callbackResult) => {
      if (callbackResult == null) {
        canvas.remove();
        reject(new Error('Error during conversion from ImageData to Blob.'));
      } else {
        canvas.remove();
        resolve(callbackResult);
      }
    });
  });
}

/**
 * Bitmap can be held in GPU memory and is faster for drawing.
 * @param base64
 */
export function transformImageDataToImageBitmap(
  imageData: ImageData
): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const canvasContext = canvas.getContext('2d');
    if (canvasContext == null) {
      reject(
        new Error(
          'Could not get canvas context for conversion from ImageData to Blob.'
        )
      );
      return;
    }
    canvasContext.putImageData(imageData, 0, 0);
    if (typeof canvas.transferToImageBitmap === 'function') {
      resolve(canvas.transferToImageBitmap());
    } else {
      resolve(createImageBitmap(canvas));
    }
  });
}
