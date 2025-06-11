import { useEffect, useRef, useState, useCallback } from "react";
import useMediaQuery from "./useMediaQuery";
const useInfiniteScroll = <T extends { id: string }>(
  fetchMethod: (filters: any, getOnly?: boolean) => Promise<any>,
  filters: any
) => {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const filtersRef = useRef(filters);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetchMethod(
        { ...filters, page, limit: pageSize },
        true
      );
      const newData: T[] = response.data;
      setData((prev) => (page === 1 ? newData : [...prev, ...newData]));
      setHasMore(response?.data?.length > 0 && page < response?.totalPages);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filters, pageSize]);

  useEffect(() => {
    if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
      setPage(1);
      setData([]);
      filtersRef.current = filters;
    }
  }, [filters]);

  useEffect(() => {
    if (!isMobile) return;
    const observerOptions = {
      root: containerRef.current,
      rootMargin: "300px 0px",
      threshold: 0,
    };

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }, observerOptions);

    if (sentinelRef.current) {
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading, isMobile]);

  const removeItems = useCallback((itemIds: string[]) => {
    setData((prevData) =>
      prevData.filter((item: any) => !itemIds.includes(item.id))
    );
  }, []);

  const updateItems = (
    idOrIds: string | string[],
    fieldUpdated: Partial<T>
  ) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    setData((prev) =>
      prev.map((item) =>
        ids.includes(item.id) ? { ...item, ...fieldUpdated } : item
      )
    );
  };

  return {
    data,
    loading,
    containerRef,
    sentinelRef,
    removeItems,
    updateItems,
  };
};

export default useInfiniteScroll;
