import { Drawer, Empty, Rate, Spin, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { IoChevronBackOutline } from 'react-icons/io5';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import SearchInput from 'src/cms/components/Search/SearchInput';
import DataTable from 'src/cms/components/Table/DataTable';
import { useTableConfig } from 'src/hooks/useTable';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import useReviewStore, { FilterReview, Review } from 'src/store/useReviewStore';
import { TiStarFullOutline } from 'react-icons/ti';
import BaseButton from 'src/shared/components/Buttons/Button';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import useInfiniteScroll from 'src/hooks/useInfiniteScroll';
import CardReviewMobile from './components/CardReviewMobile';
import useMediaQuery from 'src/hooks/useMediaQuery';
import NoData from 'src/cms/components/NoData/NoData';

const ReviewManager: FC = () => {
  const { getQuery } = useUrlQuery();
  const [filters, setFilters] = useState<FilterReview>({
    search: getQuery('search') || undefined,
    criteriaId: getQuery('criteriaId') ? getQuery('criteriaId')?.split(',') : undefined,
    star: getQuery('star') ? Number(getQuery('star')) : undefined
  });
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const {
    fetchCritierias,
    fetchReviews,
    fetchAverage,
    fetchReviewDetail,
    isLoadingDetail,
    average,
    reviews,
    critierias,
    reviewDetail,
    total
  } = useReviewStore();

  const { data: dataMobile, loading, containerRef, sentinelRef } = useInfiniteScroll<Review>(fetchReviews, filters);

  const [showDetail, setShowDetail] = useState(false);
  const { tableProps, resetToFirstPage } = useTableConfig<Review, FilterReview>({
    data: reviews,
    totalItems: total,
    isLoading: false,
    fetchData: fetchReviews,
    filters: filters
  });

  const handleFiltersChange = (newFilters: Partial<FilterReview>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  useEffect(() => {
    fetchCritierias();
    fetchAverage();
  }, []);

  const columns: TableColumnsType<Review> = [
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      render: (value: { id: string; name: string }) => <p className='text-sm'>{value?.name}</p>
    },
    {
      title: 'Ngày đánh giá',
      render: (value: Review) => <p className='text-sm'>{dayjs(value?.createdAt).format('HH:mm DD/MM/YYYY')}</p>
    },
    {
      title: 'Tiêu chí đánh giá',
      dataIndex: 'ratingCriteria',
      width: 600,
      render: (
        arr: {
          id: string;
          criteria: {
            id: string;
            name: string;
          };
          star: number;
        }[]
      ) => {
        const priorityOrder = average?.map((item) => item?.name);

        const sortedArr = arr.sort((a, b) => {
          return priorityOrder.indexOf(a.criteria.name) - priorityOrder.indexOf(b.criteria.name);
        });

        return (
          <div className='flex gap-2 flex-wrap'>
            {sortedArr.map((item) => (
              <div className={`flex gap-1 px-2 py-1 rounded-full items-center`} key={item.id}>
                <p className='text-sm'>{item.criteria.name}</p>
                <p className='text-sm ml-1'>{item.star}</p>
                <TiStarFullOutline className='text-sunflowerYellow text-[20px]' />
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div className='max-w-[200px]'>
          <p className='text-sm line-clamp-1'>{content}</p>
        </div>
      )
    }
  ];

  const starOptions = [
    { label: '1 sao', value: 1 },
    { label: '2 sao', value: 2 },
    { label: '3 sao', value: 3 },
    { label: '4 sao', value: 4 },
    { label: '5 sao', value: 5 }
  ];

  const criteriaOptions = critierias.map((criteria) => ({
    label: criteria.name,
    value: criteria.id
  }));
  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3'>
          <h2 className='text-[16px] lg:text-xl xl:text-2xl'>Quản lý đánh giá</h2>
          <div className='flex lg:hidden items-center gap-2'>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm đánh giá...'
                },
                {
                  key: 'criteriaId',
                  label: 'Tiêu chí',
                  type: 'select',
                  options: criteriaOptions,
                  placeholder: 'Chọn tiêu chí',
                  mode: 'multiple'
                },
                {
                  key: 'star',
                  label: 'Đánh giá',
                  type: 'select',
                  options: starOptions,
                  placeholder: 'Chọn số sao'
                }
              ]}
              filters={filters}
              setFilters={(newFilters) => {
                setFilters(newFilters);
                resetToFirstPage();
              }}
              placement='bottomCenter'
              className='w-full'
            />
          </div>
        </div>
      }
    >
      {!isMobile && (
        <div className='relative hidden lg:flex flex-wrap items-center justify-between gap-4 mb-6'>
          <div className='flex items-center gap-2 flex-1'>
            <SearchInput
              defaultValue={filters.search}
              onSearch={(value) => handleFiltersChange({ search: value })}
              placeholder='Tìm kiếm đánh giá...'
              className='w-full lg:max-w-96 flex-1'
            />
            <FilterDropdown
              filtersFields={[
                {
                  key: 'criteriaId',
                  label: 'Tiêu chí',
                  type: 'select',
                  options: criteriaOptions,
                  placeholder: 'Chọn tiêu chí',
                  mode: 'multiple'
                },
                {
                  key: 'star',
                  label: 'Đánh giá',
                  type: 'select',
                  options: starOptions,
                  placeholder: 'Chọn số sao'
                }
              ]}
              filters={filters}
              setFilters={(newFilters) => {
                setFilters((prev) => ({ ...prev, ...newFilters }));
                resetToFirstPage();
              }}
              className='w-full'
            />
          </div>
        </div>
      )}
      <DataTable<Review>
        rowKey='id'
        className='hidden lg:block'
        columns={columns}
        {...tableProps}
        scroll={{ x: 'max-content' }}
        onRow={(record) => ({
          onClick: () => {
            setShowDetail(true);
            fetchReviewDetail(record.id);
          }
        })}
        locale={{ emptyText: <NoData /> }}
      />
      <div className='lg:hidden flex flex-col flex-1 overflow-y-scroll max-h-[calc(100svh-96px)]' ref={containerRef}>
        {!dataMobile?.length && !loading && <NoData />}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-2'>
          {dataMobile?.map((item) => (
            <CardReviewMobile
              key={item?.id}
              item={item}
              average={average}
              onClickReviewDetail={(id) => {
                setShowDetail(true);
                fetchReviewDetail(id);
              }}
            />
          ))}
        </div>
        <Spin spinning={loading} className='flex justify-center items-center' />
        <div ref={sentinelRef} />
      </div>
      <Drawer
        title={
          <div className='flex items-center justify-between cursor-pointer' onClick={() => setShowDetail(false)}>
            <p className='text-lg'>Chi tiết đánh giá</p>
            <p className='text-sm text-mediumGray'>{dayjs(reviewDetail?.createdAt).format('HH:mm DD/MM/YYYY')}</p>
          </div>
        }
        placement='right'
        width={500}
        closable={true}
        onClose={() => setShowDetail(false)}
        closeIcon={
          <BaseButton
            variant='text'
            className='flex items-center justify-center w-2 bg-transparent'
            icon={<IoChevronBackOutline className=' !text-[#151d2d]' size={26} />}
          ></BaseButton>
        }
        open={showDetail}
      >
        {isLoadingDetail ? (
          <div className='flex items-center justify-center'>
            <Spin />
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            <div>
              <p className='lg:text-sm font-semibold mb-3'>
                Tên khách hàng:<span className='font-normal'> {reviewDetail?.customer?.name}</span>
              </p>
              <p className='lg:text-sm font-semibold'>
                Khu vực / Bàn:
                <span className='font-normal'>
                  {' '}
                  {reviewDetail?.zoneName} - {reviewDetail?.tableName}
                </span>
              </p>
            </div>
            <div>
              <p className='text-base font-semibold mb-2 '>Tiêu chí đánh giá:</p>
              <div className=' rounded-lg' style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}>
                {reviewDetail?.ratingCriteria?.map((criteria, index) => (
                  <div className={`flex items-center justify-between px-2 py-3`} key={criteria.criteria.id}>
                    <BaseButton
                      variant='text'
                      className='h-[20px] text-sm rounded-[10px] px-[6px] pointer-events-none !text-black'
                    >
                      {criteria.criteria.name}
                    </BaseButton>
                    <div className='flex items-center'>
                      <Rate disabled value={criteria.star} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className='text-base font-semibold mb-1'>Nội dung đánh giá:</p>
              {reviewDetail?.content && (
                <div className='text-sm font-normal border rounded-lg px-2 py-3 w-full break-words whitespace-pre-line'>
                  {reviewDetail?.content}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </MainHeader>
  );
};

export default ReviewManager;
