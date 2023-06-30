import Navbar from '../components/Navbar';
import '../styles.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import Head from 'next/head';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
            </Head>
            <QueryClientProvider client={queryClient}>
                <Navbar />
                <main>
                    <div className="container">
                        <Component {...pageProps} />
                    </div>
                </main>
            </QueryClientProvider>
        </>
    );
}
