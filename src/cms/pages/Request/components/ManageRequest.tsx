import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRequestStore from 'src/store/useRequestStore';
import RequestStaff from './RequestStaff';
import ListOrder from './ListOrder';
import OverlayLoader from 'src/shared/components/Loading/OverlayLoader';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { RequestStatus, RequestType } from 'src/shared/common/enum';
import { usePrompt } from 'src/hooks/usePrompt';

const ManageRequest: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequestDetail, detailRequest, isLoading } = useRequestStore();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (id) {
      getRequestDetail(id);
    }
  }, [id]);

  useEffect(() => {
    if (detailRequest && detailRequest.status !== RequestStatus.PENDING) {
      navigate(`/request/history/${id}`);
    }
    if (detailRequest && detailRequest.table && detailRequest.type === RequestType.PAYMENT) {
      navigate(
        `/request?zoneId=${detailRequest.table.zone.id}&tableId=${detailRequest.table.id}&type=${RequestType.PAYMENT}`
      );
    }
  }, [detailRequest]);

  usePrompt('Bạn có chắc chắn muốn rời khỏi trang khi có thay đổi chưa lưu?', hasUnsavedChanges);

  if (isLoading || !detailRequest) {
    return <OverlayLoader spinning={true} children={null} />;
  }
  const handleBack = () => {
    if (hasUnsavedChanges && detailRequest.type !== RequestType.STAFF) {
      const confirmed = window.confirm('Bạn có chắc chắn muốn rời khỏi trang khi có thay đổi chưa lưu?');
      if (!confirmed) return;
    }
    navigate(-1);
  };

  return (
    <DetailHeader
      title={detailRequest.type === RequestType.STAFF ? 'Chi tiết yêu cầu gọi nhân viên' : 'Chi tiết yêu cầu gọi món'}
      handleBack={handleBack}
    >
      {detailRequest.status === RequestStatus.PENDING && detailRequest.type === RequestType.STAFF ? (
        <RequestStaff />
      ) : (
        <ListOrder setHasUnsavedChanges={setHasUnsavedChanges} />
      )}
    </DetailHeader>
  );
};

export default ManageRequest;
