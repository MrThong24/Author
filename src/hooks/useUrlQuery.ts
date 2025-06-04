import { useSearchParams, useNavigationType } from 'react-router-dom';

export const useUrlQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();

  const getQuery = (key: string) => searchParams.get(key);

  const setQuery = (key: string, value: string | undefined) => {
    if (value === undefined || value === null) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    // Use replace: true to prevent adding to browser history
    setSearchParams(searchParams, { replace: true });
  };

  const setQueries = (queries: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(queries).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    
    setSearchParams(newSearchParams, { replace: true });
  };

  const getAllQuery = () => {
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  };

  const clearAllQueries = () => {
    setSearchParams('', { replace: true });
  };

  return { 
    getQuery, 
    setQuery, 
    getAllQuery, 
    setQueries,
    clearAllQueries,
    isBackNavigation: navigationType === 'POP'
  };
};