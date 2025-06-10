import React from "react";
import { Modal } from "antd";
import useDisableScroll from "src/hooks/useDisableScroll";
import BaseButton from "../Buttons/Button";
import { twMerge } from "tailwind-merge";
import useMediaQuery from "src/hooks/useMediaQuery";

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
  type?: "primary" | "default" | "danger" | "remade" | undefined;
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
  confirmLabel = "Đồng ý",
  cancelLabel = "Huỷ bỏ",
  width = 510,
  type = "primary",
  showCancel = true,
  disabled = false,
  loading,
  className = "",
  buttonClassName = "",
  button,
}) => {
  useDisableScroll(isOpen);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={width}
      footer={
        <div className="flex flex-row gap-2 justify-end items-end mt-4">
          <BaseButton
            key="confirm"
            className={twMerge(
              `text-base font-medium py-4`,
              buttonClassName
                ? buttonClassName
                : type === "remade"
                  ? "bg-[#F89734] hover:!bg-[#F89734]/80"
                  : "bg-primary"
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
              key="cancel"
              onClick={onClose}
              variant="outlined"
              className="text-base font-medium py-4 text-primary"
            >
              {cancelLabel}
            </BaseButton>
          )}
        </div>
      }
      centered={!!isMobile}
      title={<span className="text-xl text-start text-gray-600">{title}</span>}
    >
      <div className={`flex items-center justify-start ${className}`}>
        {children}
      </div>
    </Modal>
  );
};

export default CustomModal;
