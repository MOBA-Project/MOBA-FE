import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthed } from './token';

const RequireAuth: React.FC<{ children: React.ReactNode }>=({ children })=>{
  const nav = useNavigate();
  if (!isAuthed()) {
    nav('/');
    return null;
  }
  return <>{children}</>;
};

export default RequireAuth;

