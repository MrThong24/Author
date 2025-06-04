import { Dropdown, Space, DropDownProps, Empty } from 'antd';
import React from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import BaseSelect from 'src/shared/components/Core/Select';
import { LuSlidersHorizontal } from 'react-icons/lu';
import SearchInput from '../Search/SearchInput';
import { IoCloseCircle } from 'react-icons/io5';
import { BaseDatePicker } from 'src/shared/components/Core/BaseDatePicker';
import { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import { twMerge } from 'tailwind-merge';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { FiSearch } from 'react-icons/fi';

type FilterType = 'search' | 'select' | 'date-range';

interface FilterOption {
  label: string;
  value: string | number;
}

// Thay đổi FilterValue để chỉ chứa các giá trị không thể là undefined
type FilterValue = string | number | string[] | number[] | Dayjs | null | [Dayjs | null, Dayjs | null];

export interface FilterConfig {
  key?: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  mode?: 'multiple' | 'tags';
  datePickerProps?: Partial<React.ComponentProps<typeof BaseDatePicker.RangePicker>>;
}

// Add these props to the interface
interface FilterDropdownProps extends Omit<DropDownProps, 'dropdownRender'> {
  filters: any;
  setFilters: (filters: Record<string, FilterValue>) => void;
  filtersFields: FilterConfig[];
  className?: string;
  position?:
    | 'bottomLeft'
    | 'bottomRight'
    | 'topLeft'
    | 'topRight'
    | 'top'
    | 'bottomCenter'
    | 'topCenter'
    | 'bottom'
    | undefined;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filters,
  setFilters,
  filtersFields,
  className = '',
  position = 'bottomLeft'
}) => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const handleFiltersChange = (key: string, value: FilterValue) => {
    const _filterValue = { ...filters };
    _filterValue[key] = value;
    setFilters(_filterValue);
  };

  const handleFilterDateRange = (value: NoUndefinedRangeValueType<Dayjs> | null) => {
    const _filters = { ...filters };
    if (value === null) {
      _filters.isClearFilterDate = true;
    } else {
      _filters.isClearFilterDate = false;
    }
    const startDate = value?.[0] ? dayjs(value?.[0]) : undefined;
    _filters.startDate = startDate;
    if (value?.[1]?.toString().includes('17:00:00')) {
      const endDate = value?.[1] ? dayjs(value?.[1]).add(1, 'day').subtract(1, 'second') : undefined;
      _filters.endDate = endDate;
    }
    setFilters(_filters);
  };

  const checkFilters = () => {
    const keysToCheck = filtersFields.map((fieltersField) => fieltersField.key);
    const hasOnlyEmptyValues = keysToCheck.every((key) => {
      const value = filters[key as keyof typeof filters];
      if (Array.isArray(value) && value.length === 0) {
        return true;
      }
      return !value;
    });

    if (hasOnlyEmptyValues) {
      if (filtersFields.find((filterField) => filterField.type === 'date-range')) {
        if (filters.startDate && filters.endDate) {
          return true;
        } else return false;
      }
      return false;
    }
    return true;
  };
  const isOnlySearchFilters = filtersFields?.every((filter) => filter.type === 'search');

  const filtered = checkFilters();
  const renderFilterInput = (filter: FilterConfig) => {
    const key = filter.key || '';
    const defaultValue = key ? filters[key] : undefined;

    switch (filter.type) {
      case 'search':
        return (
          <div className='flex md:w-auto mb-2'>
            <div className='flex items-center w-full'>
              {!isOnlySearchFilters && (
                <label className='text-sm min-w-20 text-gray-500 hidden md:block '>{filter.label}</label>
              )}
              <SearchInput
                onSearch={(value) => key && handleFiltersChange(key, value || '')}
                placeholder={filter.placeholder || `Tìm kiếm ${filter.label}`}
                defaultValue={defaultValue?.toString()}
              />
            </div>
          </div>
        );
      case 'select':
        return (
          <div className='flex items-center mb-2'>
            <label className='text-sm min-w-20 text-gray-500 hidden md:block flex-1'>{filter.label}</label>
            <BaseSelect
              style={{ width: '100%' }}
              placeholder={filter.placeholder || `Chọn ${filter.label}`}
              allowClear
              options={filter.options}
              onChange={(value) => key && handleFiltersChange(key, value || null)}
              mode={filter.mode}
              value={defaultValue}
              className='w-full min-w-[160px]'
              showSearch
              clearIcon={
                <IoCloseCircle className=' text-black-400 hover:text-black-600 text-[24px] absolute bottom-[-6px] right-[-6px]' />
              }
              optionFilterProp='label'
              notFoundContent={<Empty description='Không có dữ liệu' />}
            />
          </div>
        );
      case 'date-range':
        return (
          <div className='flex items-center justify-center mb-2'>
            <label className='text-sm min-w-20 text-gray-500 hidden md:block '>{filter.label}</label>
            <BaseDatePicker.RangePicker
              style={{ width: '100%' }}
              value={filters.startDate && filters.endDate ? [dayjs(filters.startDate), dayjs(filters.endDate)] : null}
              onChange={(value) => handleFilterDateRange(value)}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              maxDate={dayjs().endOf('day')}
              {...filter.datePickerProps} // can add default props
            />
          </div>
        );
      default:
        return null;
    }
  };

  const menu = (
    <div
      className={twMerge(
        `bg-white shadow-lg p-4 rounded-lg w-screen max-w-screen mx-auto sm:w-auto sm:max-w-[350px] md:max-w-[400px] `
      )}
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {filtersFields.map((filter) => (
          <div key={filter.key}>{renderFilterInput(filter)}</div>
        ))}
      </Space>
    </div>
  );
  return (
    <div className='rounded-full lg:rounded-md shadow-md flex items-center justify-center cursor-pointer'>
      <Dropdown
        dropdownRender={() => menu}
        trigger={['click']}
        className={twMerge(
          `max-w-[32px] max-h-[30px] !rounded-full lg:!max-w-full lg:!max-h-full lg:!rounded-md ${className}`
        )}
        placement={isMobile ? 'bottomCenter' : position}
        getPopupContainer={(triggerNode) => triggerNode?.parentNode as HTMLElement}
      >
        <div
          onClick={(e) => e.preventDefault()}
          className={`rounded-md flex items-center justify-center px-2 h-[32px] ${filtered ? 'bg-primary' : 'white'}`}
        >
          {isOnlySearchFilters ? (
            <FiSearch color={filtered ? 'white' : 'black'} size={24} />
          ) : (
            <LuSlidersHorizontal color={filtered ? 'white' : 'black'} size={20} />
          )}
        </div>
      </Dropdown>
    </div>
  );
};

export default FilterDropdown;
