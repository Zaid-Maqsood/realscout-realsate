import { createContext, useContext, useState, useCallback } from 'react';

const PageContextContext = createContext(null);

export function PageContextProvider({ children }) {
  const [pageContext, setPageContext] = useState('');

  const updatePageContext = useCallback((text) => {
    setPageContext(text || '');
  }, []);

  return (
    <PageContextContext.Provider value={{ pageContext, updatePageContext }}>
      {children}
    </PageContextContext.Provider>
  );
}

export const usePageContext = () => useContext(PageContextContext);
