"use client";
import { useCrmTokenHook } from "@/hooks/crm-authentication-hook";
import { refreshKeycloakToken } from "@/services/keycloak/keyclock-service";
import { createContext, useContext, useEffect } from "react";

export interface authContextType {
    crmToken: any;
    refreshToken: any;
}

export const AuthContext = createContext<authContextType>({ crmToken: "", refreshToken: "" });

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            crmToken: null,
            refreshToken: null
        }
    }
    return context;
}

export const AuthContextProvider =  ({children}: { children: React.ReactNode }) => {
    const {data: crmToken} = useCrmTokenHook();
    
    useEffect(() => {
        if (crmToken) {
            localStorage.setItem('token', crmToken.access_token);
            localStorage.setItem('refresh_token', crmToken.refresh_token);
    
            const interval = setInterval(async () => {
                const storedRefreshToken = localStorage.getItem('refresh_token');
                if (storedRefreshToken) {
                    try {
                        const refreshed = await refreshKeycloakToken(storedRefreshToken);
                        const newToken = refreshed.data;
    
                        localStorage.setItem('token', newToken.access_token);
                        localStorage.setItem('refresh_token', newToken.refresh_token);
                        // optionally update the context state here if you introduce useState
                        // setCrmToken(newToken.access_token)
                    } catch (error) {
                        console.error("Token refresh failed", error);
                        // handle logout if refresh fails
                    }
                }
            }, 55 * 1000); // refresh just before 1 minute
    
            return () => clearInterval(interval);
        }
    }, [crmToken]);
    

    return <AuthContext.Provider value={{ crmToken: crmToken?.access_token, refreshToken: crmToken?.refresh_token }}>{children}</AuthContext.Provider>;
}
