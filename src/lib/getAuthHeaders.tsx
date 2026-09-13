import getAuthToken from "./getAuthToken";

/**
 * Build request headers. When the user isn't signed in we OMIT the
 * Authorization header entirely instead of sending "Bearer null",
 * which Laravel rejects with 401 { message: "Unauthenticated." }.
 */
const getAuthHeaders = (options: { json?: boolean } = { json: true }): Record<string, string> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        Accept: "application/json",
    };
    if (options.json !== false) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

export default getAuthHeaders;
