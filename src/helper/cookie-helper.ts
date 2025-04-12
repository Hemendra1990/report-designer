import { GlobalKeys } from "@/types/constants/global-keys";


interface CookieOptions {
    days?: number;
    sameSite?: 'Strict' | 'Lax' | 'None';
    path?: string;
}

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
    const { days = 7, sameSite = 'Lax', path = '/' } = options;

    const maxAge = days * 24 * 60 * 60;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `;path=${path}`;
    cookieString += `;max-age=${maxAge}`;
    cookieString += `;samesite=${sameSite}`;

    document.cookie = cookieString;
};

export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=').map((c) => c.trim());
        if (decodeURIComponent(cookieName) === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
};

export const deleteCookie = (name: string, options: Omit<CookieOptions, 'days'> = {}) => {
    setCookie(name, '', { ...options, days: -1 });
};

export const clearAllCookies = () => {
    deleteCookie(GlobalKeys.AUTH_COOKIE_NAME);
    deleteCookie(GlobalKeys.REFRESH_COOKIE_NAME);
};
