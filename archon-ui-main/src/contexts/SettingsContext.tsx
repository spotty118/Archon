import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { credentialsService } from '../services/credentialsService';

interface SettingsContextType {
  projectsEnabled: boolean;
  setProjectsEnabled: (enabled: boolean) => void;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export { SettingsContext };
export type { SettingsContextType };

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [projectsEnabled, setProjectsEnabledState] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Load Projects setting
      const projectsResponse = await credentialsService.getCredential('PROJECTS_ENABLED').catch(() => ({ value: undefined }));
      
      if (projectsResponse.value !== undefined) {
        setProjectsEnabledState(projectsResponse.value === 'true');
      } else {
        setProjectsEnabledState(true); // Default to true
      }
      
    } catch (error) {
  // console.error('Failed to load settings:', error);
      setProjectsEnabledState(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const setProjectsEnabled = async (enabled: boolean): Promise<void> => {
    try {
      // Update local state immediately
      setProjectsEnabledState(enabled);

      // Save to backend
      await credentialsService.createCredential({
        key: 'PROJECTS_ENABLED',
        value: enabled.toString(),
        is_encrypted: false,
        category: 'features',
        description: 'Enable or disable Projects and Tasks functionality'
      });
    } catch (error) {
  // console.error('Failed to update projects setting:', error);
      // Revert on error
      setProjectsEnabledState(!enabled);
      throw error;
    }
  };

  const refreshSettings = async (): Promise<void> => {
    await loadSettings();
  };

  const value: SettingsContextType = {
    projectsEnabled,
    setProjectsEnabled,
    loading,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 