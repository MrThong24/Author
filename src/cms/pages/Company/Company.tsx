import React, { useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { Menu } from 'antd';
import { MenuProps } from 'antd/lib';
import ManageCompany from './ManageCompany/ManageCompany';
import BaseSelect from 'src/shared/components/Core/Select';
import POSConnect from './POSConnect/POSConnect';
type MenuItem = Required<MenuProps>['items'][number];

export default function Company() {
  const [current, setCurrent] = useState<string>('company');

  const items: MenuItem[] = [
    {
      label: 'Thông tin tài khoản',
      key: 'company'
    },
    {
      label: 'Kết nối MobiFone 1POS',
      key: 'pos'
    }
  ];
  const componentsMap: Record<string, React.ReactNode> = {
    company: <ManageCompany />,
    pos: <POSConnect />
  };
  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3'>
          <h2 className='hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto'>Thông tin công ty</h2>
          <div className='xl:hidden flex flex-1 items-center gap-3'>
            <BaseSelect
              className='w-[190px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
              defaultValue={current}
              onChange={setCurrent}
              options={[
                {
                  label: 'Thông tin tài khoản',
                  value: 'company'
                },
                {
                  label: 'Kết nối MobiFone 1POS',
                  value: 'pos'
                }
              ]}
            />
          </div>
        </div>
      }
    >
      <div className='flex items-center gap-2 justify-between mb-4 mbsm:mb-0'>
        <h2 className='sm:hidden text-[16px] font-bold'>Thông tin công ty</h2>
      </div>
      <div className='hidden xl:block mb-4'>
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode='horizontal'
          items={items}
          className='!bg-transparent shadow-none border-none'
        />
      </div>
      <div className='mt-4'>{componentsMap[current]}</div>
    </MainHeader>
  );
}
