import { QueryKeys } from "@/components/enum/query-keys";
import { KeycloakResponse } from "@/components/model/keycloak-response";
import { fetchKeycloakToken } from "@/services/keycloak/keyclock-service";
import { useQuery } from "@tanstack/react-query";

export const useCrmTokenHook = () => {
    const crmToken = useQuery<KeycloakResponse>({
        queryKey: [QueryKeys.KEYCLOAK_RESPONSE],
        queryFn: () => fetchKeycloakToken().then((res) => {
            return res?.data;
        }),
        // staleTime: 1000
    })

    return crmToken;
}