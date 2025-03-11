import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Partner } from '../types';

interface AuthContextType {
  partner: Partner | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedPartner = localStorage.getItem('partner');
    if (storedPartner) {
      setPartner(JSON.parse(storedPartner));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a successful login
      const mockPartner: Partner = {
        id: '1',
        name: 'Partner Company',
        email: email
      };
      
      setPartner(mockPartner);
      localStorage.setItem('partner', JSON.stringify(mockPartner));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setPartner(null);
    localStorage.removeItem('partner');
  };

  return (
    <AuthContext.Provider value={{ partner, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 