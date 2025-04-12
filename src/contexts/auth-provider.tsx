"use client"
import { clearAllCookies, setCookie } from '@/helper/cookie-helper';
import { GlobalKeys } from '@/types/constants/global-keys';
import Keycloak from 'keycloak-js';
import { createContext, useContext, useEffect, useState } from "react";
import { useClientIdProvider } from './client-id-provider';


type AuthContextType = {
    isAuthenticated: boolean;
    keycloak: any;
    handleLogOut: () => void;
}

export const AuthProviderContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { clientId } = useClientIdProvider(); 
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [keycloak, setKeycloak] = useState<any>(null);
    const handleLogOut = () => {
        if (keycloak) {
            keycloak?.logout();
            setIsAuthenticated(false);
            clearAllCookies();
        }
    }
    useEffect(() => {
        const authenticateByKeycloak = async () => {
            const isDomain = (process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'qa');
            const KEY_CLOAK_AUTH_URL = isDomain ? `${window.location.origin}/${process.env.NEXT_PUBLIC_KEY_CLOAK_AUTH_PATH}` : `${process.env.NEXT_PUBLIC_KEY_CLOAK_AUTH_URL}`;
            const kc = new Keycloak({
                "realm": clientId,
                "url": KEY_CLOAK_AUTH_URL,
                "clientId": clientId, // dynamically
            });

            try {
                const authenticated = await kc.init({ onLoad: 'login-required', checkLoginIframe: false, enableLogging: true });
                setKeycloak(kc);
                setIsAuthenticated(authenticated);
                if (authenticated) {
                    //auth token setting
                    setCookie(GlobalKeys.AUTH_COOKIE_NAME, kc.token);
                    setCookie(GlobalKeys.REFRESH_COOKIE_NAME, kc.refreshToken);
                }
            } catch (error) {
                console.error('Error initializing Keycloak:', error);
            }
        };
        if (!keycloak && clientId) {
            authenticateByKeycloak();
        }
    }, [keycloak,clientId]);

    useEffect(() => {
        if (isAuthenticated && keycloak) {
            const tokenRefreshInterval = 60 * 1000; // Refresh token every 60 seconds
            const refreshTokenIfNeeded = async () => {
                try {
                    const currentTime = new Date().getTime();
                    // if (currentTime > tokenExpiryTime) {
                        console.log('Refreshing token...');
                        const refreshed = await keycloak.updateToken(tokenRefreshInterval);
                        if (refreshed) {
                            /*sessionStorage.setItem('token', keycloak.token);*/
                            //refresh token logic
                            setCookie(GlobalKeys.AUTH_COOKIE_NAME, keycloak.token);
                            setCookie(GlobalKeys.REFRESH_COOKIE_NAME, keycloak.refreshToken);
                        } else {
                            console.log('Access token refresh failed');
                            keycloak.logout();
                        }
                } catch (error) {
                    console.error('Error refreshing access token:', error);
                }
            };

            const tokenRefreshTimer = setInterval(refreshTokenIfNeeded, tokenRefreshInterval);

            return () => {
                clearInterval(tokenRefreshTimer);
            };
        }
    }, [isAuthenticated, keycloak]);


    if (!keycloak || !isAuthenticated) {
        return null;
    }

    return (
        <AuthProviderContext.Provider value={{ isAuthenticated, keycloak, handleLogOut }}>
            {children}
        </AuthProviderContext.Provider>
    );
}

export const useAuthProviderContext = () => useContext(AuthProviderContext);