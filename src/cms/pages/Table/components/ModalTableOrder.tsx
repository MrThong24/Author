import { Spin, Table, TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';
import IconBlue from 'src/shared/components/Icons/IconBlue';
import CustomModal from 'src/shared/components/Modals/Modal';
import { LuUsersRound } from 'react-icons/lu';
import { Session } from 'src/types/session.type';
import useTableStore from 'src/store/useTableStore';
import useRequestStore from 'src/store/useRequestStore';
import { RequestType } from 'src/shared/common/enum';
import { IoWarningOutline } from 'react-icons/io5';
import ModalWarning from 'src/cms/components/Modal/ModalWarning';
import { getConfirmMessage } from 'src/shared/utils/utils';
import useOrderStore from 'src/store/useOrderStore';

interface ModalTableOrderProps {
  id: string | undefined;
  onClose: () => void;
  onConfirm: (sessionId: string) => void;
  isOpen: boolean;
  loading?: boolean;
}

const ModalTableOrder: React.FC<ModalTableOrderProps> = ({ id, isOpen, onClose, onConfirm, loading }) => {
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const { isLoading: isTableLoading, tableDetails, setTableDetails, getTableDetails } = useTableStore();
  const { isLoading: isRequestLoading, getRequestCounts } = useRequestStore();
  const [confirmMessage, setConfirmMessage] = useState<string>(
    'Các yêu cầu chưa được xử lý sẽ bị hủy, bạn có chắc chắn muốn thanh toán?'
  );
  const { loadingCreateOrder } = useOrderStore();
  useEffect(() => {
    if (isOpen && id) {
      getTableDetails(id);
    } else {
      setTableDetails(null);
      setSessionId('');
    }
  }, [isOpen]);

  const [sessionId, setSessionId] = useState<string>(tableDetails?.sessions?.[0]?.id || '');

  const columns: TableColumnsType<Session> = [
    { title: 'Tên khách hàng', dataIndex: 'customerName', width: 200 },
    { title: 'Số điện thoại', dataIndex: 'customerPhone', width: 180 }
  ];

  const handleCheckRequestsOfSession = async () => {
    const requestCounts = await getRequestCounts(sessionId, { type: RequestType.ORDER });
    const confirmMessage = getConfirmMessage(requestCounts, true);
    if (confirmMessage) {
      setConfirmMessage(confirmMessage);
      setOpenConfirmModal(true);
      return;
    }
    onConfirm(sessionId);
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        title='Chọn khách hàng cần thanh toán'
        icon={<IconBlue icon={<LuUsersRound />} />}
        onClose={onClose}
        onConfirm={handleCheckRequestsOfSession}
        loading={loading || isTableLoading || isRequestLoading || loadingCreateOrder}
        disabled={!sessionId}
        textColorIcon='#005FAB'
      >
        <div className='w-full'>
          <Spin spinning={isTableLoading}>
            <div className='w-full text-center'>
              <Table
                columns={columns}
                dataSource={tableDetails?.sessions}
                pagination={false}
                size='small'
                scroll={{ y: 200 }}
                rowKey={'id'}
                rowSelection={{
                  type: 'radio',
                  preserveSelectedRowKeys: true,
                  selectedRowKeys: [sessionId],
                  onSelect: (record) => {
                    setSessionId(record.id);
                  }
                }}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      setSessionId(record.id);
                    }
                  };
                }}
              />
            </div>
          </Spin>
        </div>
      </CustomModal>
      <ModalWarning
        isOpen={openConfirmModal}
        icon={<IoWarningOutline />}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={() => {
          onConfirm(sessionId);
          setOpenConfirmModal(false);
        }}
        loading={loading || isTableLoading}
      >
        <p className='text-center'>{confirmMessage}</p>
      </ModalWarning>
    </>
  );
};

export default ModalTableOrder;
