import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthCaregiver = () => {
  const { caregiver, setCaregiver, login, logout } = useContext(AuthContext);
  return { caregiver, setCaregiver, login, logout };
};
