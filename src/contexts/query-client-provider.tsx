"use client"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60 * 10,
        },
    },
});

function ClientQueryProviders({children}: { children: React.ReactNode }) {
    
    return (
        <QueryClientProvider client={queryClient} >
            {children}
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    )
}

export default ClientQueryProviders