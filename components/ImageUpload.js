import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import axios from 'axios';
import React from 'react';

const ImageUpload = ({ challengeId }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const queryClient = useQueryClient();
    const router = useRouter();
    const id = router.query.id;

    const uploadImage = async (formData) => {
        await axios.post('/api/photos', formData);
    };

    const { mutate, isLoading, error } = useMutation(uploadImage, {
        onSuccess: () => {
            queryClient.invalidateQueries('challenge', id);
        },
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append('image', data.image[0]);
        formData.append('challengeId', challengeId);
        mutate(formData);
    };

    return (
        <div style={{ width: '50%', margin: '40px auto' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="image">
                    Upload an image (Maximum file size: 15MB)
                </label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    {...register('image', {
                        required: 'Image is required',
                        validate: {
                            fileSize: (value) =>
                                value[0].size <= 15 * 1024 * 1024 ||
                                'File size should be up to 15 MB',
                        },
                    })}
                />
                {errors.image && <span>{errors.image.message}</span>}
                {error && (
                    <span>Oops! There was a problem uploading your image.</span>
                )}
                <div className="submit">
                    <button type="submit" disabled={isLoading || errors.image}>
                        {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ImageUpload;
