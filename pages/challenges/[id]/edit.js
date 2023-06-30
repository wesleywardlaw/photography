import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import axios from 'axios';
import React from 'react';

const EditChallengeForm = () => {
    const router = useRouter();
    const { id } = router.query;

    const queryClient = useQueryClient();
    const {
        handleSubmit,
        register,
        formState: { isSubmitting },
    } = useForm();

    const {
        data: challenge,
        isLoading,
        isError,
    } = useQuery(
        ['challenge', id],
        async () => {
            const response = await axios.get(`/api/challenges/${id}`);
            return response.data;
        },
        { enabled: !!id, refetchOnWindowFocus: false }
    );

    const editChallengeMutation = useMutation(
        (data) => axios.patch(`/api/challenges/${id}`, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['challenge', id]);
                // Redirect to challenge details page after successful edit
                router.push(`/challenges/${id}`);
            },
        }
    );

    if (isLoading || !id) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <p>Error fetching challenge details</p>;
    }

    const onSubmit = async (formData) => {
        try {
            await editChallengeMutation.mutateAsync(formData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="form-container more-width margin-top-50px">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="title">Title</label>
                <input
                    {...register('title')}
                    type="text"
                    id="title"
                    defaultValue={challenge.title}
                />

                <label htmlFor="description">Description</label>
                <textarea
                    {...register('description')}
                    id="description"
                    style={{ marginBottom: '8px' }}
                    defaultValue={challenge.description}
                />

                <div className="submit">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditChallengeForm;
