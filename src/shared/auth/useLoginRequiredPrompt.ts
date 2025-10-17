import { useNavigate } from 'react-router-dom';
import { isAuthed } from './token';

export function useLoginRequiredPrompt(message = '로그인이 필요합니다.'){
  const nav = useNavigate();
  return function ensureAuthed<T>(action: ()=>T|Promise<T>) {
    if (!isAuthed()) {
      // eslint-disable-next-line no-alert
      alert(message);
      nav('/');
      return;
    }
    return action();
  }
}

