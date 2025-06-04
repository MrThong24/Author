import { Tooltip } from 'antd';
import { FaRegEdit } from 'react-icons/fa';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { SlClose } from 'react-icons/sl';
import { useTheme } from 'src/provider/ThemeContext';
import { PiNotePencil } from 'react-icons/pi';
import { HistoryRequest } from 'src/types/request.type';
import { imageCardDefault } from 'src/assets/images';
import { AiOutlinePrinter, AiOutlineReload } from 'react-icons/ai';
interface ICardRequestProductProps {
  productName: string;
  note?: string | null;
  reason?: HistoryRequest[];
  table?: string;
  quantityNeed: number;
  quantityAvailble: number;
  title: string;
  onConfirm: any;
  onCancel: any;
  time?: string;
  type?: string;
  permission: boolean;
  thumbnail?: string;
  isPrintEnabled?: boolean;
  onPrint?: () => void;
}

export default function CardRequestProduct({
  productName,
  note,
  reason,
  table,
  quantityNeed,
  quantityAvailble,
  title,
  onConfirm,
  onCancel,
  time,
  type,
  permission,
  thumbnail,
  isPrintEnabled = false,
  onPrint = () => {}
}: ICardRequestProductProps) {
  const { theme } = useTheme();
  return (
    <div
      className='bg-white p-[10px] rounded-[5px] mb-[15px] h-full'
      style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}
    >
      <div className='flex items-center justify-between h-full'>
        <div className='flex gap-x-[10px] items-center sm:flex-[0.5] md:flex-1 flex-1 h-full relative'>
          <div className='rounded-[5px] w-[80px] h-[80px] overflow-hidden bg-red-200 relative'>
            <img src={thumbnail ?? imageCardDefault} className='w-full h-full object-cover' alt='' />

            <div className='absolute inset-0 bg-black/20' />

            <div className='text-[14px] text-white bg-primary px-[4px] py-[2px] rounded-[5px] font-medium absolute top-0 right-0 min-w-[50%] text-center z-10'>
              {quantityAvailble || 0} / {quantityNeed || 0}
            </div>
          </div>
          <div className='flex-1 h-full'>
            <div className='flex sm:hidden md:flex justify-between mb-1'>
              <div className='flex-1'>
                <p className='font-medium text-[12px] line-clamp-2'>{table}</p>
                <p className='rounded-[5px] text-green-500 bg-green-500/10 inline-block py-[1px] px-[8px] text-[10px]'>
                  {time}
                </p>
              </div>
              <div className='w-[180px]'>
                {permission && (
                  <div className='flex items-center justify-end gap-x-[10px] '>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                      }}
                      className='shadow-md w-[50px] h-[40px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer'
                    >
                      <SlClose size={22} color='white' />
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirm();
                      }}
                      className='bg-primary text-white flex items-center gap-x-[10px] w-[150px] px-2 rounded-[6px] py-[10px] cursor-pointer text-[14px] hover:bg-primary-400 transition-colors'
                    >
                      <FaRegCircleCheck size={22} /> <p className='whitespace-nowrap'>{title}</p>
                    </div>
                  </div>
                )}
              </div>
              {isPrintEnabled && (
                <div className='absolute right-0 bottom-0'>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrint();
                    }}
                    className={`shadow-md w-[40px] h-[40px] rounded-md flex justify-center items-center border-primary border  cursor-pointer`}
                  >
                    <AiOutlinePrinter size={22} className='text-primary' />
                  </div>
                </div>
              )}
            </div>
            <div className='flex items-center mt-4'>
              <h2 className='text-sm font-medium line-clamp-1'>{productName}</h2>
            </div>

            {note && (
              <Tooltip title={note} color={theme?.primary} trigger={'hover'}>
                <div
                  className='flex gap-2 items-center text-[#595959] w-fit'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <PiNotePencil size={18} className='text-[16px] min-w-[16px]' />
                  <p className='font-light line-clamp-1'>{note}</p>
                </div>
              </Tooltip>
            )}

            {reason && reason?.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {reason &&
                      reason?.length > 0 &&
                      reason.map((item: HistoryRequest, index: number) => (
                        <p className='text-sm' key={item.id}>
                          Lý do làm lại (lần {(reason?.length || 0) - index}) {item?.reason}
                        </p>
                      ))}
                  </div>
                }
                color={theme?.primary}
                trigger='hover'
              >
                <div
                  className='flex gap-2 items-center text-[#595959] w-fit'
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <PiNotePencil size={18} className='text-[16px] text-danger min-w-[16px]' />
                  <p className='font-light text-danger text-sm line-clamp-1'>Có yêu cầu làm lại</p>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        <div className='text-center flex-col flex-[0.2] sm:flex md:hidden hidden'>
          <div className='flex-1'>
            <p className='text-sm font-medium'>{table}</p>
            {time && (
              <p className='rounded-[5px] text-green-500 bg-green-500/10 inline-block py-[1px] px-[8px] text-[10px]'>
                {time}
              </p>
            )}
          </div>
        </div>
        <div className='gap-4 justify-end flex-[0.3] sm:flex md:hidden hidden'>
          <div className='flex justify-between items-start'>
            {permission && (
              <div className='flex items-center justify-end gap-x-[10px]'>
                {isPrintEnabled && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrint();
                    }}
                    className={`shadow-md w-[40px] h-[40px] rounded-md flex justify-center items-center border-primary border  cursor-pointer`}
                  >
                    <AiOutlinePrinter size={22} className='text-primary' />
                  </div>
                )}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  className={`shadow-md w-[40px] h-[40px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer`}
                >
                  <SlClose size={22} color='white' />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirm();
                  }}
                  className='bg-primary text-white flex items-center gap-x-[10px] w-[150px] px-2 rounded-[6px] py-[10px] cursor-pointer text-[14px] hover:bg-primary-400 transition-colors'
                >
                  <FaRegCircleCheck size={22} />
                  <p className='whitespace-nowrap'>{title}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
