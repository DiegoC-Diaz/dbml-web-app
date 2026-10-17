import axios ,{AxiosError, type InternalAxiosRequestConfig} from "axios";
import { tokenStore } from "./tokenStore";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BASE_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
})


api.interceptors.request.use((config)=>{
    const token=tokenStore.get()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})


let refreshPromise:Promise<string>|null=null

async function refreshAccessToken() {
  // Usa axios "limpio" (no `api`) para no pasar por los interceptores
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh`, null, { withCredentials: true },
  )
  tokenStore.set(data.accessToken)
  return data.accessToken as string
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null })
        const token = await refreshPromise
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        tokenStore.set(null)
        // notificar logout (evento, callback registrado por AuthContext)
      }
    }
    return Promise.reject(error)
  },
)
