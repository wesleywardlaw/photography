import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useMutation } from 'react-query';
import { useUser } from '../lib/hooks';
import Router from 'next/router';

const AddChallenge = () => {
    const createChallenge = async (data) => {
        await axios.post('/api/challenges', data);
    };
    const mutation = useMutation(createChallenge);
    useEffect(() => {
        if (mutation.isSuccess) {
            reset();
        }
    }, [mutation.isSuccess]);
    const [user, { loading }] = useUser();
    const { register, handleSubmit, reset } = useForm();
    useEffect(() => {
        if ((!user && !loading) || (!loading && user?.role !== 'admin')) {
            Router.replace('/login');
        }
    }, [user, loading]);
    if (loading || !user || user?.role !== 'admin') {
        return <div>Loading...</div>;
    }

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className="form-container more-width margin-top-50px">
            {mutation.isError && (
                <p style={{ color: 'red' }}>
                    Oops! There was a problem. Please try again.
                </p>
            )}
            {mutation.isSuccess && (
                <p style={{ color: 'green' }}>Challenge created successfully</p>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Title:</label>
                <input
                    type="text"
                    {...register('title', { required: true })}
                    style={{
                        padding: '8px',
                        marginBottom: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}
                />

                <label>Description:</label>
                <textarea
                    style={{ width: '100%', marginBottom: '8px' }}
                    {...register('description', { required: true })}
                />

                <div className="submit">
                    <button type="submit" disabled={mutation.isLoading}>
                        {mutation.isLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddChallenge;
