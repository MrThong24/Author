import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'src/hooks/useDebounce';
import BaseInput from 'src/shared/components/Core/Input';
import type { SizeType } from 'antd/es/config-provider/SizeContext';
import { MdSearch } from 'react-icons/md';

interface DebouncedSearchProps {
  onSearch?: (value: string | undefined) => void;
  delay?: number;
  defaultValue?: string | number | null;
  className?: string;
  placeholder?: string;
  size?: SizeType;
}

const SearchInput = ({
  onSearch = () => {},
  delay = 500,
  defaultValue = '',
  className = '',
  placeholder = 'Search...',
  ...props
}: DebouncedSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(String(defaultValue));
  const debouncedValue = useDebounce(searchTerm, delay);
  const prevValueRef = useRef(defaultValue);

  useEffect(() => {
    setSearchTerm(String(defaultValue));
  }, [defaultValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  useEffect(() => {
    // Only trigger search if the value has actually changed from the previous value
    if (debouncedValue.trim() !== String(prevValueRef.current).trim()) {
      prevValueRef.current = debouncedValue;
      onSearch(debouncedValue.trim() || undefined);
    }
  }, [debouncedValue, onSearch]);

  return (
    <BaseInput
      placeholder={placeholder}
      value={searchTerm}
      {...props}
      onChange={handleChange}
      prefix={<MdSearch/>}
      className={className}
    />
  );
};

export default SearchInput;