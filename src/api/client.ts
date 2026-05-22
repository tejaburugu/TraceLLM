import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json"
  }
});

export function isApiUnavailable(error: unknown) {
  return axios.isAxiosError(error) && (!error.response || error.response.status === 404);
}
