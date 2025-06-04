import { FaMinus, FaPlus } from 'react-icons/fa6';
import BaseButton from 'src/shared/components/Buttons/Button';
import { twMerge } from 'tailwind-merge';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}
const QuantityInput: React.FC<QuantityInputProps> = ({ value = 0, onChange, disabled = false, className }) => {
  return (
    <div className='flex items-center gap-2'>
      <BaseButton
        size='small'
        icon={<FaMinus />}
        onClick={() => onChange(--value)}
        shape='circle'
        disabled={value <= 1}
      />
      <span className={twMerge('text-lg font-medium', className)}>{value}</span>
      <BaseButton size='small' icon={<FaPlus />} shape='circle' onClick={() => onChange(++value)} disabled={disabled} />
    </div>
  );
};

export default QuantityInput;
