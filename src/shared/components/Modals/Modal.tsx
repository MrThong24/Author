import React from 'react';
import { Modal, Button } from 'antd';
import useDisableScroll from 'src/hooks/useDisableScroll';
import BaseButton from '../Buttons/Button';
import { twMerge } from 'tailwind-merge';
import useMediaQuery from 'src/hooks/useMediaQuery';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  bgColorIcon?: string;
  textColorIcon?: string;
  width?: number;
  type?: 'primary' | 'default' | 'danger' | 'remade' | undefined;
  buttonClassName?: string;
  showCancel?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  button?: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Đóng',
  icon,
  bgColorIcon = '#ffffff',
  textColorIcon = '#000000',
  width = 510,
  type = 'primary',
  showCancel = true,
  disabled = false,
  loading,
  className = '',
  buttonClassName = '',
  button
}) => {
  useDisableScroll(isOpen);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={width}
      footer={
        <div className='flex flex-col gap-2'>
          <BaseButton
            key='confirm'
            className={twMerge(
              `text-lg font-semibold py-5`,
              buttonClassName
                ? buttonClassName
                : type === 'remade'
                  ? 'bg-[#F89734] hover:!bg-[#F89734]/80'
                  : 'bg-primary'
            )}
            color={type}
            onClick={onConfirm}
            loading={loading}
            disabled={disabled}
          >
            {confirmLabel}
          </BaseButton>
          {button}
          {showCancel && (
            <BaseButton
              key='cancel'
              onClick={onClose}
              variant='link'
              className='text-lg font-semibold py-5 text-black hover:text-primary'
            >
              {cancelLabel}
            </BaseButton>
          )}
        </div>
      }
      centered={!!isMobile}
      title={
        <div className='flex flex-col items-center justify-center gap-2'>
          <div
            className={`flex p-3 rounded-full text-2xl`}
            style={{ backgroundColor: bgColorIcon, color: textColorIcon }}
          >
            {icon}
          </div>
          <span className='text-xl text-center'>{title}</span>
        </div>
      }
    >
      <div className={`flex items-center justify-center ${className}`}>{children}</div>
    </Modal>
  );
};

export default CustomModal;
