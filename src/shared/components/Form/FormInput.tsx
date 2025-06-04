import { ReactElement } from 'react';
import { Control, Controller, FieldValues, Path, FieldErrors, ControllerRenderProps } from 'react-hook-form';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { InputProps, TextAreaProps } from 'antd/lib/input';
import BaseInput from '../Core/Input';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps & TextAreaProps, 'name' | 'type'> {
  control: Control<T>;
  name: Path<T>;
  type?: 'text' | 'password' | 'number' | 'textarea';
  rows?: number;
  errors?: FieldErrors<T>;
  size?: 'large' | 'middle' | 'small';
  hidePasswordToggle?: boolean;
}
const FormInput = <T extends FieldValues>({
  control,
  name,
  type = 'text',
  rows,
  errors,
  size = 'middle',
  ...props
}: FormInputProps<T>): JSX.Element => {
  const computedStatus = errors?.[name] || errors?.[name]?.message || errors?.message ? 'error' : '';

  const components: Record<string, (field: ControllerRenderProps<T, Path<T>>) => ReactElement> = {
    text: (field) => <BaseInput {...field} {...props} size={size} status={computedStatus} />,
    password: (field) => (
      <BaseInput.Password
        {...field}
        {...props}
        iconRender={
          props.hidePasswordToggle
            ? () => null
            : (visible: boolean) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)
        }
        size={size}
        status={computedStatus}
      />
    ),
    number: (field) => <BaseInput {...field} {...props} type='number' size={size} status={computedStatus} />,
    textarea: (field) => (
      <BaseInput.TextArea {...field} {...props} rows={rows || 4} size={size} status={computedStatus} />
    )
  };

  return (
    <div className='w-full'>
      <Controller name={name} control={control} render={({ field }) => components[type](field)} />
      {(errors?.[name]?.message || errors?.message) && (
        <p className='text-red-500 text-sm ml-[7px] h-6'>{String(errors?.[name]?.message || errors?.message || ' ')}</p>
      )}
    </div>
  );
};

export default FormInput;
