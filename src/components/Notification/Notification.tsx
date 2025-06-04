import { Dropdown, Badge, Button, notification as antdNotification } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { LuFileCheck2 } from 'react-icons/lu';
import { IoIosNotificationsOutline } from 'react-icons/io';
import http from 'src/shared/utils/http';
import { AxiosResponse } from 'axios';
import { Notifications } from 'src/types/notification';
import { BiDish } from 'react-icons/bi';
import { TbShoppingCartCancel } from 'react-icons/tb';
import dayjs from 'dayjs';
import { RequestStatus, RequestType, RoleType, SocketEnum } from 'src/shared/common/enum';
import { LuUserRound } from 'react-icons/lu';
import { MdPayment } from 'react-icons/md';
import { BellOutlined } from '@ant-design/icons';
import { getSocket, useMultiSocketEvents } from 'src/shared/utils/socket';
import { useNavigate } from 'react-router-dom';
import useRequestStore from 'src/store/useRequestStore';
import BaseButton from 'src/shared/components/Buttons/Button';
import useAuthStore from 'src/store/authStore';
import useAudioDebounce from 'src/hooks/useAudioDebounce';

export default function Notification() {
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { clearDetailRequest } = useRequestStore();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { playAudioDebounced } = useAudioDebounce(5000);

  const fetchNotifications = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response: AxiosResponse = await http.get('/notification', { params: { page, limit } });
      const newNotifications = response.data.data;
      setHasMore(newNotifications.length === limit);
      setNotifications((prevNotifications) => {
        const existingIds = new Set(prevNotifications.map((n) => n.id));
        const filteredNewNotifications = newNotifications.filter(
          (notification: Notifications) => !existingIds.has(notification.id)
        );
        return [...prevNotifications, ...filteredNewNotifications];
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight === target.scrollTop + target.clientHeight;

    if (bottom && hasMore && !loading) {
      setPage((prevPage: number) => {
        const nextPage = prevPage + 1;
        fetchNotifications(nextPage, limit);
        return nextPage;
      });
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    setNotifications((prevNotifications) => {
      return prevNotifications.map((notification) => {
        if (notificationIds.includes(notification.id)) {
          return { ...notification, isRead: true };
        }
        return notification;
      });
    });

    const unreadNotifications = notifications.filter(
      (notification) => notificationIds.includes(notification.id) && !notification.isRead
    ).length;

    setUnreadCount((prevUnreadCount) => Math.max(0, prevUnreadCount - unreadNotifications));
    try {
      if (notificationIds.length > 1) {
        await http.put('/notification/read');
      } else {
        await http.put(`/notification/read/${notificationIds[0]}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications(page, limit);
  }, [page, limit]);

  useMultiSocketEvents(
    [
      {
        event: SocketEnum.NOTIFICATION_REQUEST,
        callback: (data: Notifications) => {
          if (audioRef.current && data?.name) {
            const audioToPlay =
              data?.metadata.type === RequestType.PAYMENT ? audioRef.current.payment : audioRef.current.kitchen;
            playAudioDebounced(audioToPlay);
            document.title = 'Bạn có thông báo mới';
          }

          const key = `open${Date.now()}`;
          antdNotification.open({
            message: 'Thông báo',
            description: data.content,
            icon: <BellOutlined className='text-primary' />,
            key,
            onClick: () => {
              antdNotification.destroy(key);
              markAsRead([data.id]);
              document.title = 'Menu Online';
            }
          });

          setNotifications((prevNotifications) => {
            const existingIds = new Set(prevNotifications.map((n) => n.id));
            if (!existingIds.has(data.id)) {
              setUnreadCount((prevUnreadCount) => prevUnreadCount + 1);
              return [{ ...data, isRead: false }, ...prevNotifications];
            }
            return prevNotifications;
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: () => {
          if (currentUser?.currentUserStore?.role === RoleType.CHEF) {
            return;
          }
          playAudioDebounced(audioRef.current.kitchen);
        }
      }
    ],
    []
  );

  useEffect(() => {
    audioRef.current = {
      default: new Audio('/sounds/music.mp3'),
      payment: new Audio('/sounds/payment.mp3'),
      kitchen: new Audio('/sounds/kitchenPeding.mp3')
    };

    audioRef.current.default.volume = 0.5;
    audioRef.current.payment.volume = 0.8;
    audioRef.current.kitchen.volume = 0.8;

    return () => {
      Object.values(audioRef.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRef.current = {};
    };
  }, []);

  const getNotificationIcon = (type: string, status: string, isRead: boolean) => {
    if (type === RequestType.PAYMENT) {
      return <MdPayment className={`${isRead ? 'text-lightGray' : 'text-white'}`} size={22} />;
    }
    if (type === RequestType.STAFF) {
      return <LuUserRound className={`${isRead ? 'text-lightGray' : 'text-white'}`} size={22} />;
    }
    if (type === RequestType.ORDER && status === RequestStatus.CANCELED) {
      return <TbShoppingCartCancel className={`${isRead ? 'text-lightGray' : 'text-white'}`} size={22} />;
    }
    if (type === RequestType.ORDER) {
      return <BiDish className={`${isRead ? 'text-lightGray' : 'text-white'}`} size={22} />;
    }
  };

  const readNotificationDetails = (notificationId: string, requestId: string) => {
    markAsRead([notificationId]);
    clearDetailRequest();
    // navigate(`/request/${requestId}`);
    document.title = 'Menu Online';
  };

  const notificationItems = (
    <div className='max-w-[400px] md:w-[400px] max-h-[500px] overflow-hidden bg-white rounded-md py-2 border'>
      <div className='flex items-center justify-between px-4 mb-[4px]'>
        <div className='flex items-center gap-4'>
          <h2 className='text-[14px] font-semibold text-black'>Thông báo hệ thống</h2>
          {unreadCount > 0 && (
            <div className='relative'>
              <p className='w-[24px] h-[24px] text-[12px] rounded-[50%] border border-lightMint text-center leading-[24px] text-lightGray'>
                {unreadCount}
              </p>
              <span className='absolute top-0 right-0 flex w-2 h-2 bg-danger rounded-[50%]'></span>
            </div>
          )}
        </div>
        <BaseButton
          className='border-none text-primary font-medium text-[14px] hover:text-primary'
          variant='link'
          onClick={() => {
            markAsRead(notifications.map((n) => n.id));
            setUnreadCount(0);
          }}
          disabled={unreadCount <= 0}
        >
          <LuFileCheck2 />
          Đọc tất cả
        </BaseButton>
      </div>

      <div className='max-h-[400px] overflow-y-auto' onScroll={handleScroll}>
        {notifications.map((notification) => (
          <div
            key={notification?.id}
            onClick={() => readNotificationDetails(notification.id, notification.metadata.id)}
            className={`flex items-center gap-4 my-[4px] py-[6px] ${notification?.isRead ? 'bg-white' : 'bg-primaryWithAlpha'} px-4 cursor-pointer`}
          >
            <div
              className={`flex items-center justify-center ${notification.isRead ? 'bg-lightMint' : 'bg-primary'} w-[46px] h-[46px] rounded-[50%]`}
            >
              {getNotificationIcon(notification.metadata.type, notification?.metadata?.status, notification.isRead)}
            </div>
            <div className='flex items-center justify-between flex-1'>
              <div className='flex items-center justify-between flex-1'>
                <div className='flex flex-col justify-center items-start'>
                  <div className='px-2 border flex items-center justify-between rounded-2xl bg-lightBlueGray'>
                    <h2 className='text-[10px] text-primary font-medium'>{`${notification?.metadata?.tableName}- ${notification?.metadata?.zoneName}`}</h2>
                  </div>
                  <h2 className='text-darkestGray text-[14px] font-medium mt-[4px]'>{notification?.name}</h2>
                  <h2 className='font-normal text-[12px] text-darkGray my-[4px]'>{notification?.content}</h2>
                  <h2 className='font-normal text-[10px] text-mediumGray'>
                    {dayjs(notification?.createdAt).format('HH:mm DD/MM/YYYY')}
                  </h2>
                </div>
                <div className='w-[14px] ml-2'>
                  {!notification?.isRead && <span className='flex w-2 h-2 bg-primary rounded-[50%]'></span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && <div className='text-center p-4'>Đang tải...</div>}
      </div>
    </div>
  );

  return (
    <Dropdown
      overlay={notificationItems}
      trigger={['click']}
      open={notificationVisible}
      onOpenChange={(visible) => setNotificationVisible(visible)}
      placement={'bottomRight'}
      arrow
      overlayStyle={{
        maxWidth: 'calc(100vw - 16px)',
        padding: '8px'
      }}
    >
      <Badge count={unreadCount} size='default' offset={[-6, 1]}>
        <IoIosNotificationsOutline size={32} className='text-primary' />
      </Badge>
    </Dropdown>
  );
}
