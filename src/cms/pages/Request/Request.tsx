import { Badge, Dropdown, Space, Tabs } from 'antd';
import { ClockCircleOutlined, DownOutlined } from '@ant-design/icons';
import SearchInput from 'src/cms/components/Search/SearchInput';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import useRequestStore, { FilterRequest } from 'src/store/useRequestStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Request, RequestProduct } from 'src/types/request.type';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { BiDish } from 'react-icons/bi';
import { RequestStatus, RequestType, SocketEnum } from 'src/shared/common/enum';
import BaseButton from 'src/shared/components/Buttons/Button';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BaseSelect from 'src/shared/components/Core/Select';
import useOrderStore from 'src/store/useOrderStore';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import useZoneStore from 'src/store/useZoneStore';
import { Table, Zone } from 'src/types/table.type';
import { useMultiSocketEvents } from 'src/shared/utils/socket';
import RequestSider from './components/RequestSider';
import { useOutsideClick } from 'src/hooks/useOutsideClick';
import { getConfirmMessage } from 'src/shared/utils/utils';
import RequestCardList from './components/RequestCardList';
import ModalRejectRequest from './components/ModalRejectRequest/ModalRejectRequest';
import RequestHistoryCardList from './components/RequestHistoryCardList';
import { requestTitle } from 'src/shared/utils/request';
import RequestInprogressCardList from './components/RequestInprogressCardList';
import { getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import useAuthStore from 'src/store/authStore';
import BaseTabs from 'src/cms/components/Tabs';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import { MenuProps } from 'antd/lib';

export default function RequestList() {
  const { getQuery, setQuery } = useUrlQuery();
  const { type } = useParams();
  const location = useLocation();
  const isValidType = ['order', 'staff', 'payment'].includes(type || '');
  const hasInitialFetch = useRef({
    default: false,
    inProgress: false
  });

  // Lấy state và methods từ store
  const {
    fetchRequests,
    requests,
    total,
    isLoading,
    completedRequests,
    // completedTotal,
    isCompletedLoading,
    fetchRequestCompleted,
    inprogressRequests,
    isInprogressLoading,
    fetchRequestInprogress,
    setRequests,
    setRequestInprogress,
    getRequestCounts,
    confirmOrRejectRequest,
    fetchRequestCanceled,
    canceledRequests,
    isCanceledLoading
  } = useRequestStore();

  const { fetchZones, zones } = useZoneStore();
  const { setRequestCounts, fetchPendingRequestCounts } = useRequestStore();
  // State cho filters và pagination
  const [filters, setFilters] = useState<FilterRequest>({
    search: getQuery('search') ?? undefined,
    type: getQuery('type') ?? 'all',
    zoneId: getQuery('zoneId') ?? undefined,
    tableId: getQuery('tableId') ?? undefined
  });
  const { currentUser } = useAuthStore();
  const [isHistoryView, setIsHistoryView] = useState(filters.type === 'completed');
  const [isInprogressView, setIsInprogressView] = useState(filters.type === 'in-progress');
  const [isCanceledView, setIsCanceledView] = useState(filters.type === 'canceled');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const navigate = useNavigate();
  const { isLoading: isOrderLoading, createOrder, setIdRequest } = useOrderStore();
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const [isOpenModalCancel, SetIsOpenModalCancel] = useState(false);
  const [totalRequest, setTotalRequest] = useState(0);
  const [totalInprogressRequest, setTotalInprogressRequest] = useState(0);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Drawer/Modal handlers
  const openDrawer = (request: Request) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const openModalReject = (request: Request) => {
    setSelectedRequest(request);
    SetIsOpenModalCancel(true);
  };

  const closeDrawer = () => {
    setSelectedRequest(null);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    setTotalRequest(requests.length);
  }, [requests]);

  useEffect(() => {
    setTotalInprogressRequest(inprogressRequests.length);
  }, [inprogressRequests]);

  useEffect(() => {
    fetchZones();
  }, []);

  // Reset filters if needed
  useEffect(() => {
    if (location.state?.resetFilters) {
      // Reset all filter states
      setFilters({
        search: undefined,
        type: 'all',
        zoneId: undefined,
        tableId: undefined
      });
      navigate(location.pathname, {
        replace: true,
        state: {}
      });
      setActiveTab('all');
    }
  }, [location.state]);

  useEffect(() => {
    // Reset initial fetch tracking when filters change
    hasInitialFetch.current = {
      default: false,
      inProgress: false
    };
    // Update view states in the same effect
    setIsHistoryView(filters.type === 'completed');
    setIsInprogressView(filters.type === 'in-progress');
    setIsCanceledView(filters.type === 'canceled');
  }, [filters.type, type, filters]);

  useEffect(() => {
    if (type !== 'order') return;
    if (!isHistoryView && !isInprogressView && !isCanceledView) {
      fetchRequestInprogress({ type: RequestType.ORDER, tableId: filters.tableId, zoneId: filters.zoneId });
    }
    if (isInprogressView) {
      fetchRequests({ type: RequestType.ORDER, tableId: filters.tableId, zoneId: filters.zoneId });
    }
    if (isCanceledView) {
      fetchRequestCanceled({ type: RequestType.ORDER, tableId: filters.tableId, zoneId: filters.zoneId });
    }
  }, [isHistoryView, isInprogressView, isCanceledView, filters]);

  // Socket listeners - chuyển sang dùng useMultiSocketEvents
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: () => {
          setTotalInprogressRequest((prev) => prev + 1);
        }
      }
    ],
    []
  );

  useEffect(() => {
    if (!type) return;
    let requestType;
    switch (type) {
      case 'order':
        requestType = RequestType.ORDER;
        break;
      case 'staff':
        requestType = RequestType.STAFF;
        break;
      case 'payment':
        requestType = RequestType.PAYMENT;
        break;
      default:
        if (!isValidType) {
          navigate('/request');
          return;
        }
        requestType = undefined;
    }
    const commonParams = {
      ...filters,
      type: requestType
    };
    let fetchMethod;
    let fetchKey: 'default' | 'inProgress' | 'canceled' | null;
    if (isHistoryView) {
      fetchMethod = fetchRequestCompleted;
      fetchKey = null;
    } else if (isInprogressView) {
      fetchMethod = fetchRequestInprogress;
      fetchKey = 'inProgress';
    } else if (isCanceledView) {
      fetchMethod = fetchRequestCanceled;
      fetchKey = null;
    } else {
      fetchMethod = fetchRequests;
      fetchKey = 'default';
    }
    if (!fetchKey || !hasInitialFetch.current[fetchKey]) {
      fetchMethod(commonParams);
      if (fetchKey) {
        hasInitialFetch.current[fetchKey] = true;
      }
    }
  }, [type, filters, isHistoryView, isInprogressView, isCanceledView, hasInitialFetch]);

  // Outside click for drawer
  const wrapperRef = useOutsideClick({
    isOpen: isDrawerOpen,
    onClose: closeDrawer,
    excludeClass: 'ant-table-row'
  });

  // Filter handlers
  // const handleZoneChange = (value: string | number | undefined) => {
  //   handleFiltersChange({
  //     zoneId: value?.toString(),
  //     tableId: undefined
  //   });
  //   setFilteredTables([]);
  // };

  const matchesFilter = (request: Request) => {
    if (type) {
      switch (type) {
        case 'order':
          if (request.type !== RequestType.ORDER) return false;
          break;
        case 'staff':
          if (request.type !== RequestType.STAFF) return false;
          break;
        case 'payment':
          if (request.type !== RequestType.PAYMENT) return false;
          break;
      }
    }

    if (filters.zoneId && request.table?.zone?.id !== filters.zoneId) {
      return false;
    }

    if (filters.tableId && request.table?.id !== filters.tableId) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const customerName = request.sessionCustomer?.customer?.name?.toLowerCase() || '';
      if (!customerName.includes(searchLower)) {
        return false;
      }
    }

    return true;
  };

  // Socket listeners cho tabs khác history - chuyển sang dùng useMultiSocketEvents
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NEW,
        callback: (newRequest: Request) => {
          if (matchesFilter(newRequest)) {
            setRequests((prevRequests) => [...prevRequests, newRequest]);
          }
        }
      },
      {
        event: SocketEnum.REQUEST_OTHER_CONFIRMED,
        callback: (confirmedRequest: Request) => {
          setRequests((prevRequests) => {
            const newRequests = prevRequests.filter((request) => request.id !== confirmedRequest.id);
            return newRequests;
          });
          setRequestInprogress((prevRequests) => {
            return {
              data: prevRequests,
              total: prevRequests.length + 1
            };
          });
        }
      }
    ],
    [filters, isHistoryView]
  );

  const updateRequestProductQuantity = (prevRequests: Request[], requestProduct: RequestProduct) => {
    const requestIndex = prevRequests.findIndex((prevRequest) => prevRequest.id === requestProduct.request.id);
    if (requestIndex !== -1) {
      const requestProductIndex = prevRequests[requestIndex].requestProducts.findIndex(
        (prevRequestProduct: RequestProduct) => prevRequestProduct.id === requestProduct.id
      );
      prevRequests[requestIndex].requestProducts[requestProductIndex] = {
        ...prevRequests[requestIndex].requestProducts[requestProductIndex],
        ...getUpdateRequestProductQuantity(requestProduct)
      };
    }
    return {
      data: prevRequests,
      total: prevRequests.length
    };
  };

  // Socket listeners cho inprogressView - chuyển sang dùng useMultiSocketEvents
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: (newRequest: Request) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              return {
                data: [...prevRequests, newRequest],
                total: prevRequests.length + 1
              };
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_NOTIFY_SERVED,
        callback: (servedRequest: Request) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              const updateRequests = prevRequests.filter((request) => request.id !== servedRequest.id);
              return {
                data: updateRequests,
                total: updateRequests.length
              };
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_NOTIFY_REJECTED,
        callback: (servedRequest: Request) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              const updateRequests = prevRequests.filter((request) => request.id !== servedRequest.id);
              return {
                data: updateRequests,
                total: updateRequests.length
              };
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CANCELED,
        callback: (requestProduct: RequestProduct) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              return updateRequestProductQuantity(prevRequests, requestProduct);
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_REMADE,
        callback: (requestProduct: RequestProduct) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              return updateRequestProductQuantity(prevRequests, requestProduct);
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CHANGED,
        callback: (requestProduct: RequestProduct) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              return updateRequestProductQuantity(prevRequests, requestProduct);
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: (requestProduct: RequestProduct) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              return updateRequestProductQuantity(prevRequests, requestProduct);
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_SERVED,
        callback: (requestProduct: RequestProduct) => {
          if (isInprogressView) {
            setRequestInprogress((prevRequests) => {
              return updateRequestProductQuantity(prevRequests, requestProduct);
            });
          }
        }
      }
    ],
    [isInprogressView, filters]
  );

  // Update filtered tables when zone changes
  // useEffect(() => {
  //   if (filters.zoneId) {
  //     const zone = zones.find((z) => z.id === filters.zoneId);
  //     if (zone) {
  //       setFilteredTables(zone.tables);
  //     }
  //   } else {
  //     setFilteredTables([]);
  //   }
  // }, [filters.zoneId, zones]);

  // const handleZoneChange = (value: string | number | undefined) => {
  //   handleFiltersChange({
  //     zoneId: value?.toString(),
  //     tableId: undefined
  //   });

  //   // Khi chọn khu vực mới, chỉ lấy bàn trong khu vực đó
  //   if (value) {
  //     const zone = zones.find((z) => z.id === value);
  //     setFilteredTables(zone ? zone.tables : []);
  //   } else {
  //     // Nếu bỏ chọn khu vực, hiển thị tất cả bàn
  //     const allTables = zones.flatMap((z) => z.tables);
  //     setFilteredTables(allTables);
  //   }
  // };

  // useEffect(() => {
  //   if (filters.zoneId) {
  //     const zone = zones.find((z) => z.id === filters.zoneId);
  //     setFilteredTables(zone ? zone.tables : []);
  //   } else {
  //     // Nếu chưa chọn khu vực, hiển thị tất cả bàn
  //     const allTables = zones.flatMap((z) => z.tables);
  //     setFilteredTables(allTables);
  //   }
  // }, [filters.zoneId, zones]);

  // const handleTableChange = (value: string | number | undefined) => {
  //   handleFiltersChange({
  //     tableId: value?.toString()
  //   });
  // };

  useEffect(() => {
    if (filters.tableId && zones.length > 0) {
      // Tìm khu vực chứa bàn được chọn
      let found = false;
      for (const zone of zones) {
        const tableExists = zone.tables.some((table) => table.id === filters.tableId);
        if (tableExists) {
          found = true;
          // Tự động cập nhật khu vực nếu chưa được chọn hoặc không đúng
          if (filters.zoneId !== zone.id) {
            handleFiltersChange({ zoneId: zone.id });
          }
          break;
        }
      }

      // Nếu không tìm thấy bàn trong bất kỳ khu vực nào
      if (!found) {
        handleFiltersChange({ tableId: undefined });
      }
    }
  }, [filters.tableId, zones]);

  // lọc danh sách bàn theo khu vực
  useEffect(() => {
    if (filters.zoneId) {
      const zone = zones.find((z) => z.id === filters.zoneId);
      if (zone) {
        setFilteredTables(zone.tables);
        // Kiểm tra xem bàn đã chọn có nằm trong danh sách mới không
        const isTableValid = zone.tables.some((t) => t.id === filters.tableId);
        if (!isTableValid && filters.tableId) {
          handleFiltersChange({ tableId: undefined });
        }
      }
    } else {
      // Nếu không chọn khu vực, hiển thị tất cả bàn
      setFilteredTables(zones.flatMap((z) => z.tables));
    }
  }, [filters.zoneId, zones]);

  const [filteredZones, setFilteredZones] = useState<Zone[]>(zones);

  useEffect(() => {
    setFilteredZones(zones);
  }, [zones]);

  const handleFiltersChange = (newFilters: Partial<FilterRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePayment = (request: Request | null) => {
    if (!request) return;
    setIdRequest(request.id);
    createOrder({
      sessionId: request.sessionCustomer.sessionId,
      tableId: request?.table?.id || '',
      tableName: request?.table?.name || '',
      zoneName: request?.table?.zone?.name || ''
    }).then((order) => {
      if (order?.id) {
        if (currentUser?.currentUserStore?.store?.company?.posIntegration)
          window.ReactNativeWebView?.postMessage(
            JSON.stringify({
              type: 'NAVIGATE_TO_ORDER_DETAILS',
              payload: {
                order
              }
            })
          );
        else navigate(`/order/${order.id}`);
      } else {
        fetchRequests({ ...filters, type: RequestType.PAYMENT });
      }
    });
  };

  const handleNavigateHistory = () => {
    navigate(`/request/${type}/history?startDate=${dayjs().startOf('day')}&endDate=${dayjs().endOf('day')}`, {
      state: {
        prevFilters: filters,
        previousPath: type ? `/request/${type}` : '/request'
      }
    });
  };

  const handleAccept = async (request: Request) => {
    if (!request?.id) return;

    try {
      if (request.type === RequestType.ORDER) {
        // Logic for order requests
        const updatedProducts = request.requestProducts.map(({ productId, ...rest }) => ({
          ...rest,
          productId: productId,
          id: productId
        }));

        await confirmOrRejectRequest(request.id, {
          status: RequestStatus.INPROGRESS,
          requestProducts: updatedProducts,
          rejectReason: ''
        });
      } else {
        // Logic for other request types (staff, payment)
        await confirmOrRejectRequest(request.id, {
          status: RequestStatus.CONFIRMED,
          rejectReason: ''
        });
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận yêu cầu:', error);
    }
  };

  const handleReject = async (rejectReason: string) => {
    if (!selectedRequest?.id) return;
    try {
      await confirmOrRejectRequest(selectedRequest.id, {
        status: RequestStatus.REJECTED,
        rejectReason
      });
      SetIsOpenModalCancel(false);
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu:', error);
    }
  };

  const handleHistoryDetails = (request: Request) => {
    // navigate(`/request/history/${request.id}`, {
    //   state: {
    //     prevFilters: filters,
    //     prevPagination: {
    //       current: pagination.current,
    //       pageSize: pagination.pageSize
    //     },
    //     historyFilters: filters,
    //     historyPagination: {
    //       current: historyPagination.current,
    //       pageSize: historyPagination.pageSize
    //     }
    //   }
    // });
    openDrawer(request);
  };
  const handlePaymentRequest = async (request: Request) => {
    const requestCounts = await getRequestCounts(request.sessionCustomer.sessionId, {
      type: RequestType.ORDER
    });
    const confirmMessage = getConfirmMessage(requestCounts);
    if (confirmMessage) {
      setConfirmMessage(confirmMessage);
      setCurrentRequest(request);
      setOpenConfirmModal(true);
    } else {
      handlePayment(request);
    }
  };
  const [filterButtonsConfig, setFilterButtonConfig] = useState([
    { label: 'Chưa hoàn thành', type: 'all' },
    { label: 'Hoàn thành', type: 'completed' }
  ]);

  useEffect(() => {
    if (currentUser?.currentUserStore?.store?.kitchenDisabled) {
      setFilterButtonConfig([
        { label: 'Chưa hoàn thành', type: 'all' },
        { label: 'Hoàn thành', type: 'completed' }
      ]);
    } else {
      setFilterButtonConfig(
        type === 'order'
          ? [
              { label: 'Chưa hoàn thành', type: 'all' },
              { label: 'Đang thực hiện', type: 'in-progress' },
              { label: 'Hoàn thành', type: 'completed' },
              { label: 'Đã hủy', type: 'canceled' }
            ]
          : type === 'staff'
            ? [
                { label: 'Chưa hoàn thành', type: 'all' },
                { label: 'Hoàn thành', type: 'completed' },
                { label: 'Đã hủy', type: 'canceled' }
              ]
            : [
                { label: 'Chưa hoàn thành', type: 'all' },
                { label: 'Hoàn thành', type: 'completed' }
              ]
      );
    }
    setFilters((prev) => ({ ...prev, type: 'all' }));
  }, [currentUser, type]);

  const tabsLoading = isLoading || isCompletedLoading || isInprogressLoading || isCanceledLoading;
  const labelDropdown = filterButtonsConfig.find((item) => item.type === filters.type)?.label;
  const items: MenuProps['items'] = filterButtonsConfig.map(({ label, type }) => ({
    key: type || 'all',
    label: (
      <div
        key={type || 'all'}
        onClick={() => {
          setActiveTab(type);
          handleFiltersChange({ type });
        }}
      >
        <Badge
          count={type === undefined ? totalRequest || 0 : type === 'in-progress' ? totalInprogressRequest || 0 : 0}
          offset={[20, 6]}
        >
          <p className={filters.type === type ? 'text-primary' : 'text-black'}>{label}</p>
        </Badge>
      </div>
    )
  }));

  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3'>
          <h2 className='hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto'>
            {requestTitle(type?.toUpperCase() || '')}
          </h2>
          <div className='xl:hidden flex flex-1 items-center gap-3'>
            <Dropdown
              className='w-[164px] bg-primary py-[5px] px-[10px] rounded-full'
              menu={{ items }}
              trigger={['click']}
            >
              <p onClick={(e) => e.preventDefault()} className='text-sm text-white font-normal'>
                <Space className='flex items-center justify-between'>
                  <span>{labelDropdown}</span>
                  <DownOutlined size={14} />
                </Space>
              </p>
            </Dropdown>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Nhập tên khách hàng'
                },
                {
                  key: 'tableId',
                  options: filteredTables.map((item) => ({ value: item.id, label: item.name })),
                  label: 'Bàn',
                  type: 'select',
                  placeholder: 'Chọn bàn'
                },
                {
                  key: 'zoneId',
                  options: filteredZones.map((item) => ({ value: item.id, label: item.name })),
                  label: 'Khu vực',
                  type: 'select',
                  placeholder: 'Chọn khu vực'
                }
              ]}
              filters={filters}
              setFilters={setFilters}
              className='w-full'
            />
            <BaseButton
              icon={<ClockCircleOutlined />}
              className='rounded-md px-4 py-2 hidden mbsm:flex'
              onClick={() => navigate('history')}
            />
          </div>
        </div>
      }
    >
      <div>
        <div className='flex items-center gap-2 justify-between mb-4 mbsm:mb-0'>
          <h2 className='sm:hidden text-[16px] font-bold '>{requestTitle(type?.toUpperCase() || '')}</h2>
          <BaseButton
            icon={<ClockCircleOutlined />}
            className='rounded-md px-4 py-2 mbsm:hidden flex'
            onClick={() => navigate('history')}
          />
        </div>
        <div className='mb-2'>
          <div className='hidden xl:flex flex-col md:flex-row justify-between items-center'>
            <BaseTabs
              tabs={filterButtonsConfig.map(({ label, type }) => ({
                key: type || 'all',
                label: label,
                badge: type === undefined ? totalRequest || 0 : type === 'in-progress' ? totalInprogressRequest || 0 : 0
              }))}
              disabled={tabsLoading}
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key)}
              onAnimationEnd={(key) => {
                handleFiltersChange({ type: key });
              }}
            />
            <div className='flex items-center gap-2'>
              <FilterDropdown
                filtersFields={[
                  {
                    key: 'search',
                    label: 'Tìm kiếm',
                    type: 'search',
                    placeholder: 'Nhập tên khách hàng'
                  },
                  {
                    key: 'tableId',
                    options: filteredTables.map((item) => ({ value: item.id, label: item.name })),
                    label: 'Bàn',
                    type: 'select',
                    placeholder: 'Chọn bàn'
                  },
                  {
                    key: 'zoneId',
                    options: filteredZones.map((item) => ({ value: item.id, label: item.name })),
                    label: 'Khu vực',
                    type: 'select',
                    placeholder: 'Chọn khu vực'
                  }
                ]}
                filters={filters}
                setFilters={setFilters}
                className='w-full'
              />
              <BaseButton
                icon={<ClockCircleOutlined />}
                className='rounded-md px-4 py-2'
                onClick={handleNavigateHistory}
              >
                Xem lịch sử
              </BaseButton>
            </div>
          </div>
        </div>
        <div>
          {isHistoryView ? (
            <RequestHistoryCardList
              requests={completedRequests}
              isLoading={isCompletedLoading}
              onViewDetails={handleHistoryDetails}
            />
          ) : isInprogressView ? (
            <RequestInprogressCardList
              requests={inprogressRequests}
              isLoading={isInprogressLoading}
              onViewDetails={handleHistoryDetails}
            />
          ) : isCanceledView ? (
            <RequestHistoryCardList
              requests={canceledRequests}
              isLoading={isCanceledLoading}
              onViewDetails={handleHistoryDetails}
            />
          ) : (
            <RequestCardList
              requests={requests}
              onViewDetails={openDrawer}
              onAccept={handleAccept}
              onReject={openModalReject}
              onPayment={handlePaymentRequest}
            />
          )}
          <RequestSider
            isOpen={isDrawerOpen}
            request={selectedRequest}
            onClose={closeDrawer}
            isHistory={filters.type === 'completed'}
          />
        </div>
      </div>
      <ModalConfirm
        isOpen={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={() => {
          handlePayment(currentRequest);
          setConfirmMessage('');
          setOpenConfirmModal(false);
        }}
        loading={isOrderLoading}
      >
        <p className='text-center'>{confirmMessage}</p>
      </ModalConfirm>
      <ModalRejectRequest
        isOpen={isOpenModalCancel}
        onClose={() => SetIsOpenModalCancel(false)}
        onConfirm={handleReject}
        icon={<BiDish size={30} />}
      />
    </MainHeader>
  );
}
