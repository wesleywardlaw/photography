import { useUser } from '../lib/hooks';
import Link from 'next/link';

export default function Navbar() {
    const [user, { mutate }] = useUser();

    async function handleLogout() {
        await fetch('/api/logout');
        mutate({ user: null });
    }

    return (
        <header>
            <nav>
                <ul>
                    <li style={{ marginLeft: '0', marginRight: '40%' }}>
                        {user?.username && `Welcome, ${user?.username}!`}
                    </li>
                    <li>
                        <Link href="/" legacyBehavior>
                            <span style={{ color: 'white', cursor: 'pointer' }}>
                                Home
                            </span>
                        </Link>
                    </li>
                    {user ? (
                        <>
                            {user?.role === 'admin' && (
                                <li>
                                    <Link href="/addchallenge" legacyBehavior>
                                        <span
                                            style={{
                                                color: 'white',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Add Challenge
                                        </span>
                                    </Link>
                                </li>
                            )}
                            <li>
                                <a role="button" onClick={handleLogout}>
                                    Logout
                                </a>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/signup" legacyBehavior>
                                    <span
                                        style={{
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Sign Up
                                    </span>
                                </Link>
                            </li>

                            <li>
                                <Link href="/login" legacyBehavior>
                                    <span
                                        style={{
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Login
                                    </span>
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
            <style jsx>{`
                nav {
                    max-width: 42rem;
                    margin: 0 auto;
                    padding: 0.2rem 1.25rem;
                }
                ul {
                    display: flex;
                    list-style: none;
                    margin-left: 0;
                    padding-left: 0;
                }
                li {
                    margin-right: 1rem;
                }
                li:first-child {
                    margin-left: auto;
                }
                a {
                    color: #fff;
                    text-decoration: none;
                    cursor: pointer;
                }
                header {
                    color: #fff;
                    background-color: #349966;
                }
            `}</style>
        </header>
    );
}
