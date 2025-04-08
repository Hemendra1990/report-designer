import { AxiosResponse } from "axios";
import { httpClient } from "../http-service";

const KEYCLOAK_TOKEN_URL = process.env.NEXT_PUBLIC_KEY_CLOAK_AUTH_URL || '';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  [key: string]: any;
}

export const fetchKeycloakToken = (): Promise<AxiosResponse<any, any>> => {
    const data = new URLSearchParams({
        grant_type: "password",
        client_id: process.env.NEXT_PUBLIC_CRM_CLIENT_ID || '',
        username: process.env.NEXT_PUBLIC_CRM_USERNAME || '',
        password: process.env.NEXT_PUBLIC_CRM_PASSWORD || '',
      }).toString();
      

  const config = {
    headers: {
      // "Content-Type": "application/x-www-form-urlencoded",
      },
  };
  return httpClient.post<TokenResponse>(KEYCLOAK_TOKEN_URL, data, config);
};

export const refreshKeycloakToken = (refreshToken: string): Promise<AxiosResponse<TokenResponse>> => {
  const data = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.NEXT_PUBLIC_CRM_CLIENT_ID || '',
      refresh_token: refreshToken,
  }).toString();

  return httpClient.post<TokenResponse>(KEYCLOAK_TOKEN_URL, data, {
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
      },
  });
};
