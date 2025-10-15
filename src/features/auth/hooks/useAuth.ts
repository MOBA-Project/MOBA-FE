import { useMutation } from '@tanstack/react-query';
import { login, signup, checkId } from 'features/auth/api/users';

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useSignup() {
  return useMutation({ mutationFn: signup });
}

export function useCheckId() {
  return useMutation({ mutationFn: checkId });
}

