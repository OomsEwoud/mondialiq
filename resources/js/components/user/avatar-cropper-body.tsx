import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import AvatarZoomControl from '@/components/user/avatar-zoom-control';

interface Props {
    crop: Point;
    imageSrc: string | null;
    onCropChange: (crop: Point) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    onZoomChange: (zoom: number) => void;
    zoom: number;
}

export default function AvatarCropperBody({
    crop,
    imageSrc,
    onCropChange,
    onCropComplete,
    onZoomChange,
    zoom,
}: Props) {
    return (
        <div className="space-y-5 px-5 py-4">
            <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-xl bg-slate-950">
                {imageSrc && (
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropComplete}
                        onZoomChange={onZoomChange}
                    />
                )}
            </div>

            <AvatarZoomControl zoom={zoom} onZoomChange={onZoomChange} />
        </div>
    );
}
