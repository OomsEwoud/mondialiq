import { useCallback, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/forms/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/overlays/dialog';
import AvatarCropperBody from '@/components/user/avatar-cropper-body';
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

    const resetCropperState = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

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
            resetCropperState();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-2xl">
                <DialogHeader className="border-b border-slate-200 px-5 py-4">
                    <DialogTitle className="text-slate-900">
                        Crop profile photo
                    </DialogTitle>
                    <DialogDescription>
                        Drag and zoom the photo until your avatar looks right.
                    </DialogDescription>
                </DialogHeader>

                <AvatarCropperBody
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
                        className="rounded-lg bg-blue-950 font-bold text-white hover:bg-cyan-500 hover:text-slate-900"
                        onClick={handleApply}
                    >
                        Use cropped photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
