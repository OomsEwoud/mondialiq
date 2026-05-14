import type { Area } from 'react-easy-crop';

export const avatarOutputSize = 512;
export const avatarMimeType = 'image/jpeg';
export const avatarQuality = 0.92;

export function croppedAvatarFileName(fileName: string) {
    return fileName.includes('.')
        ? fileName.replace(/\.[^.]+$/, '.jpg')
        : `${fileName}.jpg`;
}

function createImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();

        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = src;
    });
}

export async function cropImageToAvatar(imageSrc: string, crop: Area) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('Could not create image crop.');
    }

    canvas.width = avatarOutputSize;
    canvas.height = avatarOutputSize;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        avatarOutputSize,
        avatarOutputSize,
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);

                    return;
                }

                reject(new Error('Could not create image crop.'));
            },
            avatarMimeType,
            avatarQuality,
        );
    });
}
