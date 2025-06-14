
import React, { createContext, useContext, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';

interface PushNotificationContextType {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  unregister: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export const usePushNotificationContext = () => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotificationContext must be used within a PushNotificationProvider');
  }
  return context;
};

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const { isSupported, isRegistered, token, unregister } = usePushNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (user && isSupported && isRegistered) {
      console.log('Push notifications initialized for user:', user.email);
    }
  }, [user, isSupported, isRegistered]);

  const value = {
    isSupported,
    isRegistered,
    token,
    unregister
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
};
