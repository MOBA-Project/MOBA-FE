import React from 'react';
import { useLoginRequiredPrompt } from 'shared/auth/useLoginRequiredPrompt';

const RequireAuthButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { onAuthed: ()=>void }>=({ onAuthed, children, ...rest })=>{
  const ask = useLoginRequiredPrompt();
  return <button {...rest} onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); ask(onAuthed); }}>{children}</button>
}

export default RequireAuthButton;

