import { Menu } from 'antd';
import ConfigSection from './ConfigSection/ConfigSection';
import { MenuProps } from 'antd/lib';
import { useMemo, useState } from 'react';
import ProductSetting from './ProductSetting/ProductSetting';
import KitchenSetting from './KitchenSetting/KitchenSetting';
import { GrDocumentConfig } from 'react-icons/gr';
import { FiCreditCard } from 'react-icons/fi';
import { LuCookingPot } from 'react-icons/lu';
import { RiSettings3Line } from 'react-icons/ri';
import BaseSelect from 'src/shared/components/Core/Select';

type MenuItem = Required<MenuProps>['items'][number];
type TabKeys = 'general' | 'payment' | 'productSetting' | 'kitchenSetting';

export default function SystemConfig() {
  const [currentTabs, setCurrentTabs] = useState<TabKeys>('general');
  const onClickMenu: MenuProps['onClick'] = (e) => {
    setCurrentTabs(e.key as TabKeys);
  };

  const items: MenuItem[] = [
    {
      label: 'Cấu hình chung',
      key: 'general',
      icon: <RiSettings3Line className='text-[28px]' size={20} />
    },
    {
      label: 'Cài đặt sản phẩm - yêu cầu',
      key: 'productSetting',
      icon: <GrDocumentConfig className='text-[28px]' size={20} />
    },
    {
      label: 'Cài đặt thanh toán',
      key: 'payment',
      icon: <FiCreditCard className='text-[28px]' size={20} />
    },
    {
      label: 'Cài đặt bếp',
      key: 'kitchenSetting',
      icon: <LuCookingPot className='text-[28px]' size={20} />
    }
  ];

  const componentsMap = useMemo(
    () => ({
      general: <ConfigSection type={currentTabs} />,
      payment: <ConfigSection type={currentTabs} />,
      productSetting: <ProductSetting />,
      kitchenSetting: <KitchenSetting />
    }),
    [currentTabs]
  );

  return (
    <div className='flex flex-col md:flex-row '>
      <BaseSelect
        className='w-full h-[40px] block md:hidden mb-4'
        defaultValue={currentTabs}
        onChange={setCurrentTabs}
        options={[
          {
            value: 'general',
            label: 'Thông tin tài khoản'
          },
          {
            value: 'productSetting',
            label: 'Cài đặt sản phẩm - yêu cầu'
          },
          {
            value: 'payment',
            label: 'Cài đặt thanh toán'
          },
          {
            value: 'kitchenSetting',
            label: 'Cài đặt bếp'
          }
        ]}
      />
      <div className='w-[280px] bg-white shadow-base rounded-lg p-4 h-full hidden md:block'>
        <Menu
          onClick={onClickMenu}
          selectedKeys={[currentTabs]}
          items={items}
          className='[&_.ant-menu-item-selected]:!bg-primary [&_.ant-menu-item-selected]:!text-white [&_.ant-menu-item]:flex [&_.ant-menu-item]:items-center'
        />
      </div>

      <div className='flex-1 md:px-6'>
        <div className='bg-white shadow-base rounded-lg p-6 mx-auto'>{componentsMap[currentTabs]}</div>
      </div>
    </div>
  );
}
