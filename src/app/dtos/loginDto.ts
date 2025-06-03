export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string; // Authentication token
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}