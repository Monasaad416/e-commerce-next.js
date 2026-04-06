import { useAuthStore } from "@/stores/authStore";

const getAuthToken = () => {
  const token = useAuthStore.getState().token;
  return token;
};

export default getAuthToken;