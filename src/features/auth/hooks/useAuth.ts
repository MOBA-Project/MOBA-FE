import { useMutation } from '@tanstack/react-query';
import { login, signup, checkIdAvailable as checkId } from 'features/auth/api';

export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useSignup() {
  return useMutation({ mutationFn: signup });
}

export function useCheckId() {
  return useMutation({ mutationFn: checkId });
}
