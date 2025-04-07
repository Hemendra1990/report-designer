"use client";
import { useCrmTokenHook } from "@/hooks/crm-authentication-hook";
import { createContext, useContext, useEffect } from "react";

export interface authContextType {
    crmToken: any;
}

export const AuthContext = createContext<authContextType>({ crmToken: "" });

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            crmToken: null,
        }
    }
    return context;
}

export const AuthContextProvider =  ({children}: { children: React.ReactNode }) => {
    const {data: crmToken} = useCrmTokenHook();
    useEffect(() => {
        if (crmToken) {
            localStorage.setItem('token', crmToken.access_token);
        }
    }, [crmToken])

    return <AuthContext.Provider value={{ crmToken: crmToken?.access_token }}>{children}</AuthContext.Provider>;
}
