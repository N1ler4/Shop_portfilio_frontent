import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Location {
  region: string;
  city: string;
  district: string;
}

interface LocationContextType {
  location: Location;
  isLocationConfirmed: boolean;
  setLocation: (location: Location) => void;
  confirmLocation: () => void;
  resetLocationConfirmation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<Location>({
    region: 'Все регионы',
    city: 'Выберите город',
    district: 'Выберите район',
  });
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
  };

  const confirmLocation = () => {
    // Basic validation: at least a region should be selected.
    if (location.region !== 'Все регионы') {
      setIsLocationConfirmed(true);
    } else {
      // Maybe show an alert or a message to the user
      alert('Пожалуйста, выберите регион.');
    }
  };

  const resetLocationConfirmation = () => {
    setIsLocationConfirmed(false);
  };

  return (
    <LocationContext.Provider value={{ location, isLocationConfirmed, setLocation, confirmLocation, resetLocationConfirmation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 