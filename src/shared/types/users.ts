export type LoginRequest = { id: string; password: string };
export type LoginResponse = { accessToken: string; id: string; nickname: string };

export type CheckIdRequest = { id: string };

export type SignupRequest = { id: string; password: string; nickname: string };
