import { yupResolver } from "@hookform/resolvers/yup";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import DetailHeader from "src/components/Headers/DetailHeader";
import BaseButton from "src/shared/components/Buttons/Button";
import useContractStore from "src/store/useContract";
import { ContractPayload, contractSchema } from "src/validate/contractSchema";
import ContractForm from "./ContractForm";
import dayjs, { Dayjs } from "dayjs";
import CustomModal from "src/shared/components/Modals/Modal";
import ChooseDatabase from "../components/ChooseDatabase";
import ContractDetail from "./ContractDetail";
import { Menu } from "antd";
import { RiSettings3Line } from "react-icons/ri";
import { MenuProps } from "antd/lib";
import ContractAddendum from "./ContractAddendum";
import ExtendService from "../components/ExtendService";

type MenuItem = Required<MenuProps>["items"][number];
type TabKeys = "infor" | "contract";

export default function ManageContract() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [editContract, setEditContract] = useState<boolean>(false);
  const [modalChoose, setModalChoose] = useState<boolean>(false);
  const [modalExtend, setModalExtend] = useState<boolean>(false);
  const { isLoading } = useContractStore();
  const [currentTabs, setCurrentTabs] = useState<TabKeys>("infor");
  const onClickMenu: MenuProps["onClick"] = (e) => {
    setCurrentTabs(e.key as TabKeys);
  };

  const items: MenuItem[] = [
    {
      label: "Thông tin",
      key: "infor",
    },
    {
      label: "Phụ lục hợp đồng",
      key: "contract",
    },
  ];

  const componentsMap = useMemo(
    () => ({
      infor: <ContractDetail />,
      contract: <ContractAddendum />,
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
  } = useForm<ContractPayload>({
    resolver: yupResolver(contractSchema),
    defaultValues: {
      dateContract: dayjs(),
      dateOfUse: dayjs(),
    },
  });
  const onSubmit = async (data: ContractPayload) => {
    setModalChoose(true);
  };
  const [dataSource, setDataSource] = useState<any[]>([
    {
      key: "1",
      store: "Thực đơn trực tuyến",
      databaseOptions: [
        { label: "Thục động tuyến", value: "Dữ liệu 1" },
        { label: "IPOS", value: "Dữ liệu 2" },
      ],
      selectedDatabase: undefined,
    },
    {
      key: "2",
      store: "1POS",
      databaseOptions: [
        { label: "Thục động tuyến", value: "Dữ liệu 1" },
        { label: "IPOS", value: "Dữ liệu 2" },
      ],
      selectedDatabase: undefined,
    },
  ]);
  const handleConfirm = (updatedDataSource: any[]) => {
    setDataSource(updatedDataSource);
    setModalChoose(false);
  };
  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${id ? (editContract ? "Chỉnh sửa" : "Chi tiết") : "Tạo mới"} hợp đồng`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {editContract && (
            <BaseButton
              disabled={false}
              onClick={() => {
                setEditContract(false);
              }}
              color="danger"
              className="w-[120px]"
            >
              Huỷ
            </BaseButton>
          )}
          <BaseButton
            loading={false}
            onClick={async () => {
              if (editContract || !id) await handleSubmit(onSubmit)();
              else setEditContract(true);
            }}
          >
            {editContract || !id ? "Lưu thông tin" : "Nâng cấp / đổi mới gói"}
          </BaseButton>
          <BaseButton
            loading={false}
            onClick={() => {
              setModalExtend(true);
            }}
          >
            Gian hạn hợp đồng
          </BaseButton>
        </div>
      }
      handleBack={() => navigate("/contract")}
    >
      {editContract || !id ? (
        <ContractForm
          control={control}
          clearErrors={clearErrors}
          setValue={setValue}
          errors={errors}
          loading={isLoading}
          dataTable={dataSource}
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

      <ChooseDatabase
        isOpen={modalChoose}
        onConfirm={handleConfirm}
        onClose={() => setModalChoose(false)}
        dataSource={dataSource}
      />
      <ExtendService
        isOpen={modalExtend}
        onClose={() => setModalExtend(false)}
        onConfirm={() => setModalExtend(false)}
      />
    </DetailHeader>
  );
}
