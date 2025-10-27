import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('AuthContext value:', context);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};