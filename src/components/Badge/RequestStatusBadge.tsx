import { Tag } from 'antd';
import { RequestStatus } from 'src/shared/common/enum';
import { IoRestaurantOutline } from 'react-icons/io5';
import { GrInProgress } from 'react-icons/gr';
import { CheckOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { FaCheckCircle } from 'react-icons/fa';

export const RequestStatusBadge = (status: string) => {
  const StatusBadge = ({ color, text, icon }: { color: string; text: string; icon: React.ReactNode }) => (
    <Tag className='flex gap-1 p-1 items-center justify-center max-w-28' icon={icon} color={color}>
      {text}
    </Tag>
  );

  switch (status) {
    case RequestStatus.INPROGRESS:
      return <StatusBadge color='gold' text='Đang thực hiện' icon={<GrInProgress />} />;
    case RequestStatus.SERVED:
      return <StatusBadge color='geekblue' text='Đã phục vụ' icon={<IoRestaurantOutline />} />;
    case RequestStatus.COMPLETED:
      return <StatusBadge color='blue' text='Đã hoàn tất' icon={<FaCheckCircle />} />;
    case RequestStatus.CANCELED:
      return <StatusBadge color='red' text='Đã hủy' icon={<CloseCircleOutlined />} />;
    case RequestStatus.REJECTED:
      return <StatusBadge color='volcano' text='Đã từ chối' icon={<CloseCircleOutlined />} />;
    case RequestStatus.REMADE:
      return <StatusBadge color='gold' text='Làm lại' icon={<ReloadOutlined />} />;
    default:
      return <StatusBadge color='green' text='Đã xác nhận' icon={<CheckOutlined />} />;
  }
};
