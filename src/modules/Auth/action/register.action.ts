import { api } from "../../../lib/http/client";



export interface RegisterDTO {
  email: string
  password: string
  username: string
}

export interface RegisteredUser {
  id: string
  email: string
  username: string
  createdAt?: string
  updatedAt?: string
}

export interface RegisterResponse {
  user: RegisteredUser
  token: string
}

export async function registerUser(registerDTO: RegisterDTO): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>('/auth/register', registerDTO)
  return response.data
}