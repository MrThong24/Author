import { useState, useEffect, useRef } from 'react';
import { Params } from 'src/types/params.type';
import { useUrlQuery } from './useUrlQuery';
import { TablePaginationProps } from 'src/types/utils.type';
import useMediaQuery from './useMediaQuery';

interface UseTableConfig<T, F> {
  data: T[];
  totalItems: number;
  isLoading: boolean;
  fetchData: (params: F) => void;
  filters?: F;
}

export const useTableConfig = <T, F extends Params>({
  data,
  totalItems,
  isLoading,
  fetchData,
  filters = {} as F
}: UseTableConfig<T, F>) => {
  const { getQuery, setQuery } = useUrlQuery();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const prevIsMobile = useRef(isMobile);

  useEffect(() => {
    if (prevIsMobile.current !== isMobile && isMobile) {
      const pagination = {
        page: 1,
        limit: 10
      };
      fetchData({ ...filters, ...pagination });
      setPagination({
        current: 1,
        pageSize: 10,
        total: totalItems
      });
    }
  }, [isMobile]);

  const [pagination, setPagination] = useState<TablePaginationProps>({
    current: Number(getQuery('page')) || 1,
    pageSize: Number(getQuery('limit')) || 10,
    total: totalItems
  });

  const fetchDataRef = useRef(fetchData);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: totalItems }));
  }, [totalItems]);

  useEffect(() => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters
    } as F;

    Object.keys(params).forEach((key) => {
      setQuery(key, params[key as keyof F]?.toString());
    });
    fetchDataRef.current(params);
  }, [pagination.current, pagination.pageSize, filters]);

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize
    }));
  };

  const resetToFirstPage = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1
    }));
  };

  return {
    pagination,
    handlePageChange,
    resetToFirstPage,
    tableProps: {
      data,
      loading: isLoading,
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      totalItems: pagination.total,
      onPageChange: handlePageChange
    }
  };
};
