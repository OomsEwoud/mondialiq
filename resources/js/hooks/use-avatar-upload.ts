import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';

export function useAvatarUpload() {
    const croppedAvatarInput = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropperImage, setCropperImage] = useState<string | null>(null);
    const [selectedAvatarName, setSelectedAvatarName] = useState('avatar.jpg');

    useObjectUrlCleanup(avatarPreview);
    useObjectUrlCleanup(cropperImage);

    function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            setAvatarPreview(null);

            return;
        }

        setSelectedAvatarName(file.name);
        setCropperImage(URL.createObjectURL(file));
        setCropperOpen(true);
        event.target.value = '';
    }

    function handleCroppedAvatar(file: File, previewUrl: string) {
        if (croppedAvatarInput.current) {
            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);
            croppedAvatarInput.current.files = dataTransfer.files;
        }

        setAvatarPreview(previewUrl);
    }

    return {
        avatarPreview,
        croppedAvatarInput,
        cropperImage,
        cropperOpen,
        handleAvatarChange,
        handleCroppedAvatar,
        selectedAvatarName,
        setCropperOpen,
    };
}

function useObjectUrlCleanup(url: string | null) {
    useEffect(() => {
        if (!url) {
            return;
        }

        return () => URL.revokeObjectURL(url);
    }, [url]);
}
