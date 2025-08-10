import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthUser = () => {
  const { user, setUser, login, logout } = useContext(AuthContext);
  return { user, setUser, login, logout };
};
