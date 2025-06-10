import React from "react";
import { useForm } from "react-hook-form";
import { MdOutlineDateRange } from "react-icons/md";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import FormSelect from "src/shared/components/Form/FormSelect";
import CustomModal from "src/shared/components/Modals/Modal";
import { ContractPayload } from "src/validate/contractSchema";

interface ExtendServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
export default function ExtendService({
  isOpen,
  onClose,
  onConfirm,
}: ExtendServiceProps) {
  const {
    control,
    reset,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractPayload>({});
  return (
    <CustomModal
      title="Gia hạn gói dịch vụ"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      textColorIcon="#EA580C"
      loading={false}
    >
      <div className="w-full">
        <div className="mb-4">
          <Field>
            <Label text="Thời gian sử dụng" validate={false} />
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black">
              123
            </div>
          </Field>
        </div>
        <div className="flex flex-col md:flex-row gap-x-10">
          <Field>
            <Label text="Tên khách hàng" validate={true} />
            <div className="flex gap-4 items-start">
              <FormInput
                control={control}
                name="name"
                type="number"
                placeholder="Nhập số"
                disabled={false}
                errors={errors}
                size="large"
              />
              <FormSelect
                disabled={false}
                placeholder="Đơn vị tính"
                control={control}
                name="name"
                options={[]}
                errors={errors}
                size="large"
              />
            </div>
          </Field>
        </div>
        <div className="mb-4">
          <Field>
            <Label text="Ngày bắt đầu gia hạn" validate={false} />
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black flex justify-between items-center">
              <span>123</span>
              <MdOutlineDateRange size={24} color="gray" />
            </div>
          </Field>
        </div>
        <div className="mb-4">
          <Field>
            <Label text="Ngày kết hạn" validate={false} />
            <div className="bg-[#EEECEC] rounded-md border border-[#BFBFBF] w-full h-[40px] px-2 leading-[40px] text-sm text-black flex justify-between items-center">
              <span>123</span>
              <MdOutlineDateRange size={24} color="gray" />
            </div>
          </Field>
        </div>
      </div>
    </CustomModal>
  );
}
