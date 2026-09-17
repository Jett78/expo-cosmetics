import { createContext, useContext, useState, useCallback } from 'react';

type AppLoadingContextType = {
  isDataLoaded: boolean;
  setDataLoaded: () => void;
};

const AppLoadingContext = createContext<AppLoadingContextType>({
  isDataLoaded: false,
  setDataLoaded: () => {},
});

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const setDataLoaded = useCallback(() => {
    setIsDataLoaded(true);
  }, []);

  return (
    <AppLoadingContext.Provider value={{ isDataLoaded, setDataLoaded }}>
      {children}
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading() {
  return useContext(AppLoadingContext);
}
