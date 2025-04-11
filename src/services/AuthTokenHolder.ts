

const authTokenHolderMap = new Map<string, string>();

export const setAuthToken = (key: string, value: string) => {
    authTokenHolderMap.set(key, value);
};

export const getAuthToken = (key: string) => {
    return authTokenHolderMap.get(key);
};

export const removeAuthToken = (key: string) => {
    authTokenHolderMap.delete(key);
};

export const clearAllAuthTokens = () => {
    authTokenHolderMap.clear();
};

export const getAllKeys = () => {
    return authTokenHolderMap.keys();
};
