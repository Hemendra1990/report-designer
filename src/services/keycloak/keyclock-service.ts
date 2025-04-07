import { AxiosResponse } from "axios";
import { httpClient } from "../http-service";

const KEYCLOAK_TOKEN_URL = "http://localhost:8081/realms/bip/protocol/openid-connect/token?client_id=bip";

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
        client_id: "bip",
        username: "admin@bip.com",
        password: "admin",
      }).toString();
      

  const config = {
    headers: {
      // "Content-Type": "application/x-www-form-urlencoded",
      },
  };

  return httpClient.post<TokenResponse>(KEYCLOAK_TOKEN_URL, data, config);
};