import getAuthToken from "./getAuthToken";

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}


export default getAuthHeaders
