import Navbar from '../components/Navbar';
import '../styles.css';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }) {
    return (
        <>
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
