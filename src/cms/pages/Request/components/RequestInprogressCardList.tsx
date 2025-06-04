import React from 'react';
import { Empty, Spin } from 'antd';
import { Request } from 'src/types/request.type';
import RequestInprogressCard from 'src/cms/components/Card/RequestInprogressCard';
import useLayoutStore from 'src/store/layoutStore';
import useMediaQuery from 'src/hooks/useMediaQuery';
import NoData from 'src/cms/components/NoData/NoData';

interface RequestInprogressCardListProps {
  requests: Request[];
  isLoading: boolean;
  onViewDetails: (request: Request) => void;
}

const RequestInprogressCardList: React.FC<RequestInprogressCardListProps> = ({
  requests,
  isLoading,
  onViewDetails
}) => {
  const { collapsed } = useLayoutStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spin size='large' />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return <NoData description='Không có yêu cầu nào' />;
  }

  const collapsedCss = () => {
    if (!isMobile && collapsed) return 'sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 ';
    return 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4';
  };

  return (
    <div>
      <div className={`grid grid-cols-1 ${collapsedCss()} gap-4 mb-4`}>
        {requests.map((request) => (
          <RequestInprogressCard key={request.id} request={request} onViewDetails={() => onViewDetails(request)} />
        ))}
      </div>
    </div>
  );
};

export default RequestInprogressCardList;
