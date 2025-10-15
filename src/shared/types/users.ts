export type LoginRequest = { id: string; pw: string };
export type LoginResponse = { token: string };

export type CheckIdRequest = { id: string };

export type SignupRequest = { id: string; pw: string; nick: string };

