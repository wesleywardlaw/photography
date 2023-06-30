import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useUser } from '../lib/hooks';
import Link from 'next/link';
import React, { useEffect } from 'react';
import Router from 'next/router';

const ChallengesList = () => {
    const queryClient = useQueryClient();

    const deleteChallengeMutation = useMutation(
        (id) => {
            return fetch(`/api/challenges/${id}`, {
                method: 'DELETE',
            });
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('allchallenges');
            },
        }
    );

    const [user, { loading }] = useUser();
    useEffect(() => {
        if (!user && !loading) {
            Router.replace('/login');
        }
    }, [user, loading]);

    const {
        data: challenges,
        isLoading,
        isError,
    } = useQuery(
        'allchallenges',
        async () => {
            const response = await fetch('/api/challenges');
            const data = await response.json();
            return data;
        },
        { enabled: user?.role !== undefined }
    );

    const handleDeleteChallenge = (event, id) => {
        event.stopPropagation();
        deleteChallengeMutation.mutate(id);
    };

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    if (isLoading || !challenges) {
        return <p>Loading challenges...</p>;
    }

    if (isError) {
        return <p>Error fetching challenges</p>;
    }

    return (
        <div>
            {challenges.map((challenge) => (
                <Link
                    href={`/challenges/${challenge._id}`}
                    legacyBehavior
                    key={challenge._id}
                >
                    <div style={challengeBoxStyle} id={challenge._id}>
                        {user.role === 'admin' && (
                            <button
                                style={deleteButtonStyle}
                                onClick={(e) =>
                                    handleDeleteChallenge(e, challenge._id)
                                }
                            >
                                &#10006;
                            </button>
                        )}
                        <h2 style={challengeTitleStyle}>{challenge.title}</h2>
                        <p style={challengeDescriptionStyle}>
                            {challenge.description}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

const challengeBoxStyle = {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    marginBottom: '20px',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
};

const deleteButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: 'red',
    fontSize: '18px',
    cursor: 'pointer',
};

const challengeTitleStyle = {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
};

const challengeDescriptionStyle = {
    textAlign: 'center',
    fontSize: '14px',
    marginBottom: '10px',
};

export default ChallengesList;
