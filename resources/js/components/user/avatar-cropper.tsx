import { useCallback, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Button } from '@/components/ui/forms/button';
import AvatarZoomControl from '@/components/user/avatar-zoom-control';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';
import {
    avatarMimeType,
    croppedAvatarFileName,
    cropImageToAvatar,
} from '@/lib/avatar-crop';

type AvatarCropperProps = {
    fileName: string;
    imageSrc: string | null;
    open: boolean;
    onApply: (file: File, previewUrl: string) => void;
    onOpenChange: (open: boolean) => void;
};

export default function AvatarCropper({
    fileName,
    imageSrc,
    open,
    onApply,
    onOpenChange,
}: AvatarCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null,
    );

    const handleCropComplete = useCallback(
        (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
            setCroppedAreaPixels(nextCroppedAreaPixels);
        },
        [],
    );

    async function handleApply() {
        if (!imageSrc || !croppedAreaPixels) {
            return;
        }

        const blob = await cropImageToAvatar(imageSrc, croppedAreaPixels);
        const file = new File([blob], croppedAvatarFileName(fileName), {
            type: avatarMimeType,
        });

        onApply(file, URL.createObjectURL(blob));
        onOpenChange(false);
    }

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setCroppedAreaPixels(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-2xl">
                <DialogHeader className="border-b border-slate-200 px-5 py-4">
                    <DialogTitle className="text-blue-950">
                        Crop profile photo
                    </DialogTitle>
                    <DialogDescription>
                        Drag and zoom the photo until your avatar looks right.
                    </DialogDescription>
                </DialogHeader>

                <CropperBody
                    crop={crop}
                    imageSrc={imageSrc}
                    onCropChange={setCrop}
                    onCropComplete={handleCropComplete}
                    onZoomChange={setZoom}
                    zoom={zoom}
                />

                <DialogFooter className="border-t border-slate-200 px-5 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => handleOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={!croppedAreaPixels}
                        className="rounded-lg bg-blue-950 font-black text-white hover:bg-cyan-500 hover:text-blue-950"
                        onClick={handleApply}
                    >
                        Use cropped photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type CropperBodyProps = {
    crop: Point;
    imageSrc: string | null;
    onCropChange: (crop: Point) => void;
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
    onZoomChange: (zoom: number) => void;
    zoom: number;
};

function CropperBody({
    crop,
    imageSrc,
    onCropChange,
    onCropComplete,
    onZoomChange,
    zoom,
}: CropperBodyProps) {
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
