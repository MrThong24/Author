import { Spin } from 'antd';

export const LoadingFullPage = ({ loading }: { loading: boolean }) => {
  return (
    loading && (
      <div className='fixed inset-0 w-full h-full flex justify-center items-center bg-white/70 z-[1000]'>
        <Spin size='large' />
      </div>
    )
  );
};
