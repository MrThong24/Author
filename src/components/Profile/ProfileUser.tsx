import { Dropdown } from "antd";
import { FiUser } from "react-icons/fi";
import { LuKeyRound, LuStore } from "react-icons/lu";
import { RxExit } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { imageStoreDefault } from "src/assets/images";
import BaseSelect from "src/shared/components/Core/Select";
import {
  clearLS,
  getAccessTokenFromLS,
  setAccessTokenToLS,
} from "src/shared/utils/auth";
import useAuthStore from "src/store/authStore";
import ModalConfirm from "../Modal/ModalConfirm";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RoleType } from "src/shared/common/enum";
import { generateImageURL } from "src/shared/utils/utils";

export default function ProfileUser() {
  const { currentUser, isLoading, chooseStore, getCurrentUser } =
    useAuthStore();
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string | null>();
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const navigateWithSidebarControl = (url: string) => {
    navigate(url);
  };

  const handleLogout = () => {
    clearLS();
    window.location.reload();
  };

  const { handleSubmit } = useForm({
    mode: "onChange",
  });

  const handleOnConfirm = () => {
    setOpenConfirm(true);
    setIsDrawerOpen(!isDrawerOpen);
    setIsDropdownOpen(false);
  };

  const onSubmit = async () => {
    setOpenConfirm(false);
    const res = await chooseStore({
      token: `${getAccessTokenFromLS()}` || "",
      storeId: selectedStore || "",
    });
    setAccessTokenToLS(res?.accessToken as string);
    getCurrentUser();
    if (currentUser?.currentUserStore?.role !== RoleType.CHEF) {
      navigate("/request/order");
    } else navigate("/kitchen/inprogress");
  };

  useEffect(() => {
    setSelectedStore(currentUser?.currentUserStore?.store?.id);
  }, [currentUser]);

  const content = (
    <div className="flex flex-col gap-1 bg-white p-3 rounded-md shadow-md border border-gray-200 max-w-[300px] min-w-[200px]">
      <div
        className="cursor-pointer hover:bg-primary-50 active:bg-primary-50 rounded-sm gap-1.5 p-1.5 flex text-start items-center"
        onClick={() => navigateWithSidebarControl("/user")}
      >
        <div className=" p-1 rounded-full flex-shrink-0">
          <FiUser className="text-primary" size={16} />
        </div>
        <h2 className="text-primary truncate text-sm">Thông tin - Cài đặt</h2>
      </div>
      <div
        className="cursor-pointer hover:bg-primary-50 active:bg-primary-50 rounded-sm gap-1.5 p-1.5 flex text-start items-center"
        onClick={() => navigateWithSidebarControl("/changePassword")}
      >
        <div className=" p-1 rounded-full flex-shrink-0">
          <LuKeyRound className="text-primary" size={16} />
        </div>
        <h2 className="text-primary truncate text-sm">Đổi mật khẩu</h2>
      </div>
      <div
        className="cursor-pointer hover:bg-primary-50 active:bg-primary-50 rounded-sm gap-1.5 p-1.5 flex text-start items-center"
        onClick={() => handleOnConfirm()}
      >
        <div className="p-1 rounded-full flex-shrink-0">
          <LuStore className="text-primary" size={16} />
        </div>
        <h2 className="text-primary truncate text-sm">
          {currentUser?.currentUserStore?.store?.name || ""}
        </h2>
      </div>
      <div
        className="cursor-pointer hover:bg-primary-50 active:bg-primary-50 rounded-sm gap-1.5 p-1.5 flex text-start items-center"
        onClick={handleLogout}
      >
        <div className=" p-1 rounded-full flex-shrink-0">
          <RxExit className="text-danger" size={16} />
        </div>
        <h2 className="text-danger truncate text-sm">Thoát ra</h2>
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        overlay={content}
        trigger={["click"]}
        placement={"bottomRight"}
        open={isDropdownOpen}
        onOpenChange={(open) => setIsDropdownOpen(open)}
        arrow
        overlayStyle={{
          maxWidth: "calc(100vw - 16px)",
          padding: "8px",
        }}
      >
        <div className="flex  items-center gap-2 w-full truncate">
          <img
            src={generateImageURL(currentUser?.avatar) || imageStoreDefault}
            alt="avatar"
            className="w-8 h-8 rounded-full flex-shrink-0 object-cover active:scale-95 active:brightness-90 transition-all cursor-pointer"
          />
          <span className="hidden sm:block font-medium truncate">
            {currentUser?.name || ""}
          </span>
        </div>
      </Dropdown>
      <ModalConfirm
        isOpen={openConfirm}
        title="Chọn cửa hàng"
        onClose={() => {
          setOpenConfirm(false);
          setSelectedStore(currentUser?.currentUserStore?.store?.id);
        }}
        onConfirm={handleSubmit(onSubmit)}
        icon={<LuStore size={24} />}
        loading={isLoading}
      >
        <BaseSelect
          value={selectedStore}
          options={currentUser?.userStores?.map((item) => item.store) || []}
          placeholder="Chọn cửa hàng"
          fieldNames={{
            label: "name",
            value: "id",
          }}
          optionFilterProp="name"
          showSearch
          onChange={(value) => {
            setSelectedStore(value);
          }}
          className="w-full mb-6 text-start"
        />
      </ModalConfirm>
    </>
  );
}
