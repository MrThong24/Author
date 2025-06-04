import { Empty, Pagination, Spin } from 'antd';
import { useMemo } from 'react';
import RequestCard from 'src/cms/components/Card/RequestCard';
import NoData from 'src/cms/components/NoData/NoData';
import useMediaQuery from 'src/hooks/useMediaQuery';
import useLayoutStore from 'src/store/layoutStore';
import { Request } from 'src/types/request.type';

interface RequestCardListProps {
  requests: Request[];
  onAccept?: (request: Request) => void;
  onReject?: (request: Request) => void;
  onViewDetails?: (request: Request) => void;
  onPayment?: (request: Request) => void;
}

export default function RequestCardList({
  requests,
  onAccept,
  onReject,
  onViewDetails,
  onPayment
}: RequestCardListProps) {
  const { collapsed } = useLayoutStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  if (!requests || requests.length === 0) {
    return <NoData description='Không có yêu cầu nào' />;
  }

  const collapsedCss = () => {
    if (!isMobile && collapsed) return 'sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 ';
    return 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4';
  };
  return (
    <div>
      <div className={`grid grid-cols-1 gap-4 ${collapsedCss()}}`}>
        {requests.map((request) => (
          <RequestCard
            key={`${request.id}`}
            request={request}
            onAccept={onAccept ? () => onAccept(request) : undefined}
            onReject={onReject ? () => onReject(request) : undefined}
            onViewDetails={onViewDetails ? () => onViewDetails(request) : undefined}
            onPayment={onPayment ? () => onPayment(request) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
