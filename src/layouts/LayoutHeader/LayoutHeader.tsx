import { Layout } from "antd";
import { FaBarsStaggered } from "react-icons/fa6";
import { mobifone } from "src/assets/images";
import ProfileUser from "src/components/Profile/ProfileUser";
const { Header } = Layout;

export default function LayoutHeader({
  handleToggleSidebar,
}: {
  handleToggleSidebar: () => void;
}) {
  return (
    <Header
      className="flex items-center border border-b-2 px-10"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 99,
      }}
    >
      <div className=" flex flex-1 w-full justify-between">
        <div className="flex items-center gap-4">
          <div className="cursor-pointer" onClick={handleToggleSidebar}>
            <FaBarsStaggered className="font-medium" size={20} />
          </div>
          <img src={mobifone} alt="Mobifone" className="h-6 object-contain" />
        </div>
        <div className="cursor-pointer">
          <ProfileUser />
        </div>
      </div>
    </Header>
  );
}
