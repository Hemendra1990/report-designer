"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ClientIdContext = createContext<ClientIdContextProps>(null);

interface ClientIdContextProps {
    clientId: string;
    getClientId: () => string;
}

function ClientIdProviders({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const [clientId, setClientId] = useState(null);

    useEffect(() => {
        if (isSubDomainImplemented()) {
            const subdomainClientId = getSubdomain();
            if (subdomainClientId) {
                setClientId(subdomainClientId);
            }
        } else {
            const queryClientId = searchParams.get('client_id');
            const storedClientId = sessionStorage.getItem('client_id');
            if (queryClientId) {
                setClientId(queryClientId);
                sessionStorage.setItem('client_id', queryClientId);
            } else if (storedClientId) {
                setClientId(storedClientId);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (clientId && isLocalhost()) {
            sessionStorage.setItem('client_id', clientId);
        }
    }, [clientId]);

    function getSubdomain() {
        if (typeof window !== 'undefined') {
            const windowLocation = window.location.hostname;
            const parts = windowLocation.split(".");
            if (parts.length > 2) {
                return parts[0]; // Returns the subdomain
            }
        }
        return '';
    }

    function isLocalhost() {
        if (typeof window !== 'undefined') {
            return window.location.hostname.includes('localhost');
        }
        return false;
    }

    function isSubDomainImplemented() {
        const domain = process?.env?.NEXT_PUBLIC_DOMAIN;
        if (domain && typeof window !== 'undefined') {
            return window.location.hostname.includes(domain) && !window.location.hostname.startsWith(domain);
        }
        return false;
    }

    function getClientId() {
        return clientId;
    }

    return (
        <ClientIdContext.Provider value={{ clientId, getClientId }}>
            {children}
        </ClientIdContext.Provider>
    );
}

export default ClientIdProviders;

export const useClientIdProvider = () => useContext(ClientIdContext);
