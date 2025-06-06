import { IoChevronBack } from "react-icons/io5";

interface DetailHeader {
  children: React.ReactNode;
  title: string | React.ReactNode;
  handleBack: () => void;
  rightElement?: React.ReactNode;
}

const DetailHeader: React.FC<DetailHeader> = ({
  children,
  title,
  handleBack,
  rightElement,
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between w-full flex-1">
        <button className="flex items-center gap-2 mb-4" onClick={handleBack}>
          <IoChevronBack size={26} />
          {typeof title === "string" ? (
            <h2 className="text-black font-semibold text-[16px] sm:text-xl xl:text-2xl text-start line-clamp-2 max-w-[200px] md:max-w-full">
              {title}
            </h2>
          ) : (
            title
          )}
        </button>
        <div>{rightElement}</div>
      </div>
      {children}
    </div>
  );
};

export default DetailHeader;
