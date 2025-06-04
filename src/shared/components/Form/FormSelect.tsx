import { Control, Controller, FieldErrors, FieldValues, get, Path } from 'react-hook-form';
import { SelectProps } from 'antd';
import BaseSelect from '../Core/Select';

interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name'> {
  control: Control<T>;
  name: Path<T>;
  options?: { label: string; value: string }[];
  errors?: FieldErrors<T>;
  size?: 'small' | 'middle' | 'large';
}

const FormSelect = <T extends FieldValues>({
  control,
  name,
  options = [],
  errors,
  size = 'middle',
  className,
  ...props
}: FormSelectProps<T>): JSX.Element => {
  const computedStatus = errors?.[name] || errors?.message ? 'error' : '';
  return (
    <div className='w-full'>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <BaseSelect
            {...field}
            {...props}
            size={size}
            status={computedStatus}
            options={options}
            className={`rounded-1xl mb-4 w-full ${className}`}
          />
        )}
      />
      {(errors?.message || errors?.[name]?.message) && (
        <p className='text-red-500 text-sm mt-[-15px] ml-[7px] h-6'>
          {String(errors?.[name]?.message || errors?.message || ' ')}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
