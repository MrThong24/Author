import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import DetailHeader from "src/components/Headers/DetailHeader";
import BaseButton from "src/shared/components/Buttons/Button";
import useCustomerStore from "src/store/useCustomer";
import { CustomerPayload, customerSchema } from "src/validate/customerSchema";
import CustomerForm from "./CustomerForm";
import CustomerDetail from "./CustomerDetail";
import { UploadChangeParam } from "antd/es/upload";
import { RcFile } from "antd/lib/upload";
import { Dropdown, Menu } from "antd";
import { MenuProps } from "antd/lib";
import { FaEllipsisVertical } from "react-icons/fa6";
import { BiSolidEdit } from "react-icons/bi";
import CustomModal from "src/shared/components/Modals/Modal";
import { TbFileDescription, TbLockAccess } from "react-icons/tb";
import InfoLincense from "./InfoLincense";
import ExtendService from "src/pages/Contract/components/ExtendService";
import { IoMdClose } from "react-icons/io";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import { IoPauseCircleOutline } from "react-icons/io5";
import FormInput from "src/shared/components/Form/FormInput";
import AdjustmentHistory from "./AdjustmentHistory";

type MenuItem = Required<MenuProps>["items"][number];
type TabKeys = "inforCustomer" | "infoLincense" | "adjustmentHistory";

export default function ManageCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editCustomer, setEditCustomer] = useState<boolean>(false);
  const [errorImage, setErrorImage] = useState<boolean>(false);
  const [fileImage, setFileImage] = useState<RcFile | string>();
  const { isLoading } = useCustomerStore();
  const [currentTabs, setCurrentTabs] = useState<TabKeys>("inforCustomer");
  const [modalActionInfo, setModalActionInfo] = useState<boolean>(false);
  const [modalExtend, setModalExtend] = useState<boolean>(false);
  const [modalCancel, setModalCancel] = useState<boolean>(false);
  const [modalPause, setModalPause] = useState<boolean>(false);
  const onClickMenu: MenuProps["onClick"] = (e) => {
    setCurrentTabs(e.key as TabKeys);
  };

  const items: MenuItem[] = [
    {
      label: "Thông tin",
      key: "inforCustomer",
    },
    {
      label: "Thông tin lincense",
      key: "infoLincense",
    },
    {
      label: "Lịch sử điều chỉnh",
      key: "adjustmentHistory",
    },
  ];

  const itemsInfo: MenuItem[] = [
    {
      label: "Chỉnh sửa khách hàng",
      key: "edit",
      icon: <BiSolidEdit size={18} />,
      onClick: () => setEditCustomer(true),
    },
    {
      label: "Ngưng hoạt động",
      key: "DEACTIVATED",
      icon: <TbLockAccess size={18} />,
      onClick: () => setModalActionInfo(true),
    },
    ...(currentTabs === "infoLincense"
      ? [
          {
            label: "Gia hạn gói",
            key: "extend",
            icon: <TbFileDescription size={18} />,
            onClick: () => {
              setModalExtend(true);
            },
          },
          {
            label: "Tạm ngưng dịch vụ",
            key: "pause",
            icon: <IoPauseCircleOutline size={18} />,
            onClick: () => {
              setModalPause(true);
            },
          },
          {
            label: "Huỷ gói hợp đồng",
            key: "cancel",
            icon: <IoMdClose size={18} />,
            onClick: () => {
              setModalCancel(true);
            },
          },
        ]
      : []),
  ];

  const componentsMap = useMemo(
    () => ({
      inforCustomer: <CustomerDetail />,
      infoLincense: <InfoLincense />,
      adjustmentHistory: <AdjustmentHistory />,
    }),
    [currentTabs]
  );

  const {
    control,
    reset,
    handleSubmit,
    clearErrors,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerPayload>({
    resolver: yupResolver(customerSchema),
  });

  const handleFileChange = async (info: UploadChangeParam) => {
    setFileImage(info?.file?.originFileObj);
    setErrorImage(false);
  };

  const onSubmit = async () => {
    // if (!fileImage && !detailProduct?.thumbnail) {
    //   setErrorImage(true);
    //   return;
    // }
  };

  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${id ? (editCustomer ? "Chỉnh sửa" : "Thông tin") : "Tạo mới"} khách hàng`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {editCustomer && (
            <>
              <BaseButton
                disabled={false}
                onClick={() => {
                  setEditCustomer(false);
                }}
                color="danger"
                className="w-[120px]"
              >
                Huỷ
              </BaseButton>
              <BaseButton
                loading={false}
                onClick={async () => {
                  await handleSubmit(onSubmit)();
                }}
              >
                Lưu thông tin
              </BaseButton>
            </>
          )}
          {!editCustomer && (
            <>
              <BaseButton loading={isLoading} onClick={() => {}}>
                Thêm hợp đồng
              </BaseButton>
              <Dropdown
                menu={{ items: itemsInfo }}
                trigger={["click"]}
                overlayStyle={{ top: 128 }}
              >
                <a onClick={(e) => e.preventDefault()} className="ml-2">
                  <FaEllipsisVertical size={20} />
                </a>
              </Dropdown>
            </>
          )}
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      {editCustomer || !id ? (
        <CustomerForm
          control={control}
          clearErrors={clearErrors}
          setValue={setValue}
          errors={errors}
          loading={isLoading}
          errorImage={errorImage}
          onFileChange={handleFileChange}
        />
      ) : (
        <>
          <Menu
            onClick={onClickMenu}
            selectedKeys={[currentTabs]}
            mode="horizontal"
            items={items}
            className="!bg-transparent shadow-none border-none mb-4"
          />
          {componentsMap[currentTabs]}
        </>
      )}
      <CustomModal
        isOpen={modalActionInfo}
        title="Ngưng hoạt động khách hàng"
        onClose={() => {
          setModalActionInfo(false);
        }}
        icon={false}
        onConfirm={handleSubmit(onSubmit)}
        loading={isLoading}
      >
        Bạn có chắn chắn ngưng hoạt động khách hàng này không ?
      </CustomModal>
      <ExtendService
        isOpen={modalExtend}
        onClose={() => setModalExtend(false)}
        onConfirm={() => setModalExtend(false)}
      />
      <CustomModal
        isOpen={modalCancel}
        title="HỦY GÓI DỊCH VỤ"
        onClose={() => {
          setModalCancel(false);
        }}
        icon={false}
        onConfirm={() => setModalCancel(false)}
        loading={isLoading}
      >
        <div className="w-full">
          <Field>
            <Label text="Thời gian sử dụng còn lại" validate={false} />
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black flex justify-between items-center">
              <span>123</span>
            </div>
          </Field>
          <h2 className="mt-4"> Bạn có chắc muốn hủy gói dịch vụ này không?</h2>
        </div>
      </CustomModal>
      <CustomModal
        isOpen={modalPause}
        title="Tạm ngưng sử dụng gói dịch vụ"
        onClose={() => {
          setModalPause(false);
        }}
        icon={false}
        onConfirm={() => setModalPause(false)}
        loading={isLoading}
      >
        <div className="w-full">
          <Field>
            <Label text="Thời gian sử dụng còn lại" validate={false} />
            <div className="bg-[#EEECEC] rounded w-full h-[44px] px-3 py-3 text-sm text-black flex justify-between items-center">
              <span>123</span>
            </div>
          </Field>
          <Field className="mt-4">
            <Label text="Lý do thực hiện" validate={true} />
            <FormInput
              type="textarea"
              disabled={false}
              control={control}
              name="name"
              placeholder="Mô tả"
              errors={errors}
              size="large"
            />
          </Field>
          <h2 className="mt-4">
            Bạn có chắc muốn tạm ngưng sử dụng gói dịch vụ này không?
          </h2>
        </div>
      </CustomModal>
    </DetailHeader>
  );
}
