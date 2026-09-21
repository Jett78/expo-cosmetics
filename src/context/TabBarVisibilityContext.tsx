import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type TabBarVisibilityContextValue = {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue>({
  tabBarHidden: false,
  setTabBarHidden: () => {},
});

export function TabBarVisibilityProvider({ children }: { children: ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  return (
    <TabBarVisibilityContext.Provider value={{ tabBarHidden, setTabBarHidden }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  return useContext(TabBarVisibilityContext);
}
