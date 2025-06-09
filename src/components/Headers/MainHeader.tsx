interface MainHeaderProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  loading?: boolean;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  children,
  title,
  loading = false,
}) => {
  return (
    <div className="">
      <div className="flex flex-row items-center justify-between mb-4 flex-1">
        <h2 className="text-black font-semibold text-[16px] sm:text-xl xl:text-2xl flex-1">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
};

export default MainHeader;
