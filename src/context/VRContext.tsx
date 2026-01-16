import React, { createContext, useState, useContext, useEffect } from 'react';

interface VRContextType {
  isVRMode: boolean;
  toggleVRMode: () => void;
  setVRMode: (enabled: boolean) => void;
}

const VRContext = createContext<VRContextType | undefined>(undefined);

export const VRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVRMode, setIsVRMode] = useState<boolean>(false);

  useEffect(() => {
    // Apply VR mode to document
    if (isVRMode) {
      document.body.classList.add('vr-mode');
      
      // Request fullscreen if available
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Error attempting to enable fullscreen:', err);
        });
      }
    } else {
      document.body.classList.remove('vr-mode');
      
      // Exit fullscreen if we're in it
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.warn('Error attempting to exit fullscreen:', err);
        });
      }
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('vr-mode');
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.warn('Error attempting to exit fullscreen:', err);
        });
      }
    };
  }, [isVRMode]);

  const toggleVRMode = () => {
    setIsVRMode(prev => !prev);
  };

  const setVRMode = (enabled: boolean) => {
    setIsVRMode(enabled);
  };

  return (
    <VRContext.Provider value={{ isVRMode, toggleVRMode, setVRMode }}>
      {children}
    </VRContext.Provider>
  );
};

export const useVRMode = (): VRContextType => {
  const context = useContext(VRContext);
  if (context === undefined) {
    throw new Error('useVRMode must be used within a VRProvider');
  }
  return context;
};