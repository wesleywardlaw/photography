import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import CommentForm from '../../../components/CommentForm';
import Link from 'next/link';
import { useUser } from '../../../lib/hooks';
import Router from 'next/router';
import ImageUpload from '../../../components/ImageUpload';

const ChallengeDetails = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const id = router.query.id;

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

    const deleteCommentMutation = useMutation(
        (commentId) => {
            return axios.delete(`/api/challenges/${id}/comments/${commentId}`);
        },
        {
            onMutate: (commentId) => {
                queryClient.setQueryData(['challenge', id], (oldData) => {
                    const updatedChallenge = {
                        ...oldData,
                        photos: oldData.photos.map((photo) => {
                            const updatedComments = photo.comments.filter(
                                (comment) => comment._id !== commentId
                            );
                            return {
                                ...photo,
                                comments: updatedComments,
                            };
                        }),
                    };
                    return updatedChallenge;
                });
            },
            onError: (error, commentId) => {
                // Handle error, if needed
                console.error(error);
            },
            onSettled: () => {
                queryClient.invalidateQueries(['challenge', id]);
            },
        }
    );

    const commentMutation = useMutation(
        (comment) => {
            return axios.post(`/api/challenges/${id}/comments`, comment);
        },
        {
            // Optimistic update
            onMutate: (comment) => {
                // Update the query cache optimistically
                queryClient.setQueryData(['challenge', id], (oldData) => {
                    const updatedChallenge = {
                        ...oldData,
                        photos: oldData.photos.map((photo) => {
                            if (photo.photoURL === comment.photoURL) {
                                return {
                                    ...photo,
                                    comments: [
                                        ...photo.comments,
                                        {
                                            ...comment,
                                            createdAt: Date.now(),
                                        },
                                    ],
                                };
                            }
                            return photo;
                        }),
                    };
                    return updatedChallenge;
                });

                // Return the snapshot value to be used for rollback if needed
                return { comment };
            },
            // If the mutation fails, revert to the snapshot value
            onError: (error, variables, snapshotValue) => {
                queryClient.setQueryData(['challenge', id], snapshotValue);
            },
            // Invalidate and refetch the query after a successful mutation
            onSettled: () => {
                queryClient.invalidateQueries(['challenge', id]);
            },
        }
    );

    const handleDeletePhoto = (photoId) => {
        deletePhotoMutation.mutate(photoId);
    };

    const handleDeleteComment = (commentId) => {
        deleteCommentMutation.mutate(commentId);
    };

    const deletePhotoMutation = useMutation(
        (photoId) => {
            return axios.delete(`/api/photos/${photoId}`);
        },
        {
            // Invalidate and refetch the challenges query after a successful mutation
            onSuccess: () => {
                queryClient.invalidateQueries('challenge');
            },
        }
    );

    const onSubmit = (id, data) => {
        commentMutation.mutate({
            comment: data[`${id}commentText`],
            photo: id,
        });
    };

    const [user, { loading }] = useUser();
    useEffect(() => {
        if (!user && !loading) {
            Router.replace('/login');
        }
    }, [user, loading]);
    if (loading || !user) {
        return <div>Loading...</div>;
    }

    const commentCreatedAtStyle = {
        color: '#888',
        paddingRight: `${user?.role === 'admin' ? '40px' : '0px'}`,
    };

    if (isLoading || !id) {
        return <p>Loading...</p>;
    }

    if (isError) {
        return <p>Error fetching challenge details</p>;
    }

    const reversedPhotos = challenge?.photos?.reverse();

    // return <div>hello</div>;
    return (
        <div>
            {user?.role === 'admin' && (
                <Link href={`/challenges/${id}/edit`} legacyBehavior>
                    <p
                        style={{
                            color: '#349966',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        edit
                    </p>
                </Link>
            )}
            <h1>{challenge?.title}</h1>
            <p style={{ textAlign: 'left' }}>{challenge?.description}</p>
            <ImageUpload challengeId={id} />
            {reversedPhotos?.map((photo) => (
                <div
                    key={photo.createdAt}
                    style={{
                        border: '1px solid #CCC',
                        marginTop: '10px',
                        marginBottom: '10px',
                        padding: '30px',
                        borderRadius: '4px',
                        position: 'relative',
                    }}
                >
                    <img
                        style={{
                            maxWidth: '80%',
                            maxHeight: '500px',
                            width: 'auto',
                            height: 'auto',
                            marginTop: '20px',
                            marginBottom: '20px',
                        }}
                        src={photo.photoURL}
                        alt="Challenge"
                    />
                    <p>
                        <Link
                            href={`/image?imageUrl=${encodeURIComponent(
                                photo.photoURL
                            )}`}
                            legacyBehavior
                        >
                            <a
                                style={{
                                    color: '#349966',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                }}
                            >
                                Full Size
                            </a>
                        </Link>
                    </p>
                    <p>Photo by {photo.user.username}</p>
                    {photo?.comments?.map((comment) => (
                        <div
                            key={comment.createdAt}
                            style={commentContainerStyle}
                        >
                            <div style={commentHeaderStyle}>
                                <span style={commentUsernameStyle}>
                                    {comment.user.username}
                                </span>
                                <span style={commentCreatedAtStyle}>
                                    {format(
                                        comment.createdAt,
                                        'hh:mm a, yyyy-MM-dd'
                                    )}
                                </span>
                            </div>
                            <p style={commentTextStyle}>
                                {comment.commentText}
                            </p>
                            {user?.role === 'admin' && (
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        background: 'none',
                                        border: 'none',
                                        color: 'red',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() =>
                                        handleDeleteComment(comment._id)
                                    }
                                >
                                    &#10006;
                                </button>
                            )}
                        </div>
                    ))}
                    {/* <form
                        className="form-container more-width"
                        onSubmit={handleSubmit(onSubmit)}
                        id={photo._id}
                    >
                        <input
                            type="text"
                            {...register(`${photo._id}commentText`)}
                            placeholder="Comment"
                        />
                        <div className="submit">
                            <button type="submit">Submit</button>
                        </div>
                    </form> */}
                    <CommentForm onSubmit={onSubmit} identifier={photo._id} />
                    {user?.role === 'admin' && (
                        <button
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                color: 'red',
                                fontSize: '18px',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleDeletePhoto(photo._id)}
                        >
                            &#10006;
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ChallengeDetails;

// CSS styles
const commentContainerStyle = {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    position: 'relative',
};

const commentHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px',
};

const commentUsernameStyle = {
    fontWeight: 'bold',
};

const commentTextStyle = {
    margin: 0,
};
