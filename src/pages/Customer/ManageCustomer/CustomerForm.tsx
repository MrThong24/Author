import { ColorPicker, Radio, Table, Upload, UploadProps } from "antd";
import React, { useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import BaseButton from "src/shared/components/Buttons/Button";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { CustomerPayload, customerSchema } from "src/validate/customerSchema";
import { RiResetLeftLine } from "react-icons/ri";
import { GetProp } from "antd/lib";
import { UploadChangeParam } from "antd/es/upload";
import ImgCrop from "antd-img-crop";
import { beforeUploadImage } from "src/shared/utils/common";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface CustomerForm {
  control: Control<CustomerPayload>;
  errors: FieldErrors<CustomerPayload>;
  onFileChange: (file: UploadChangeParam) => void;
  loading: boolean;
  errorImage: boolean;
  setValue: UseFormSetValue<CustomerPayload>;
  clearErrors: UseFormClearErrors<CustomerPayload>;
}

export default function CustomerForm({
  control,
  errors,
  loading,
  setValue,
  clearErrors,
  errorImage,
  onFileChange,
}: CustomerForm) {
  const [loadingImage, setLoadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoadingImage(true);
      return;
    }
    if (info.file.status === "done" || info.file.status === "error") {
      onFileChange(info);
      getBase64(info.file.originFileObj as FileType, (url) => {
        setLoadingImage(false);
        setImagePreview(url);
      });
    }
  };

  const uploadButton = (
    <BaseButton style={{ border: 0, background: "none" }}>
      {loadingImage ? (
        <LoadingOutlined className="text-[28px]" />
      ) : (
        <PlusOutlined
          className={`text-[28px] ${errorImage ? `text-danger` : `text-primary`}`}
        />
      )}
    </BaseButton>
  );

  // useEffect(() => {
  //   if (detailProduct && id) {
  //     setImagePreview(generateImageURL(detailProduct.thumbnail));
  //   }
  // }, [detailProduct, id]);
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary mt-2">
        Thông tin khách hàng
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Tên khách hàng" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập tên khách hàng"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Email" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập tên database"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Mã khách hàng" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập mã khách hàng"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="SĐT" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập "
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
      <h1 className="text-lg font-semibold text-primary mt-2">
        Thông tin hệ thống
      </h1>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-4">
          <Label text="Domain" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Domain"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
        <Field className="mt-4">
          <Label text="Địa chỉ" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập tên database"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-2">
          <Label text="Màu sắc hệ thống" validate={false} />
          <div className="flex items-center gap-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <ColorPicker
                  {...field}
                  {...fieldState}
                  defaultValue="#005FAB"
                  format={"hex"}
                  size="large"
                  showText
                  disabled={loading}
                  onChange={(value) => {
                    field.onChange(value?.toHexString());
                  }}
                  className="w-fit"
                />
              )}
            />
            <BaseButton
              variant="filled"
              className="h-full py-2 px-3"
              override="#d3e4eb"
              textColor="#005FAB"
              onClick={() => {
                setValue("name", "#005FAB");
              }}
            >
              <RiResetLeftLine className="text-xl" />
            </BaseButton>
          </div>
        </Field>
        <Field className="mt-4">
          <Label text="SĐT liên hệ" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập tên database"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field className="mt-2">
          <Label text="Logo" validate={false} />
          <ImgCrop showGrid showReset>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUploadImage}
              onChange={handleChange}
              disabled={loading}
              accept=".jpg,.png"
            >
              {imagePreview && !loadingImage ? (
                <img
                  src={imagePreview}
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </ImgCrop>
          <p
            className={`${errorImage ? "text-danger" : `text-primary`} text-[14px] mt-2`}
          >
            Nhấn vào để thêm hình ảnh
          </p>
        </Field>
        <Field className="mt-4">
          <Label text="Tên đơn vị liên hệ" validate={true} />
          <FormInput
            control={control}
            name="name"
            type="text"
            placeholder="Nhập tên database"
            disabled={false}
            errors={errors}
            size="large"
          />
        </Field>
      </div>
    </div>
  );
}
