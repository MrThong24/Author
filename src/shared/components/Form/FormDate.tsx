import { DatePicker } from "antd";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";

// Định nghĩa interface cho props của FormDate
interface FormDateProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  name: string;
  placeholder?: string;
  format?: string;
  disabled?: boolean;
  allowClear?: boolean;
  defaultValue?: Dayjs;
}

const FormDate: React.FC<FormDateProps> = ({
  control,
  errors,
  name,
  placeholder = "Chọn ngày",
  format = "DD/MM/YYYY",
  disabled = false,
  allowClear = true,
  defaultValue,
}) => {
  return (
    <div className="w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            value={field.value}
            onChange={(date) => field.onChange(date)}
            format={format}
            placeholder={placeholder}
            allowClear={allowClear}
            disabled={disabled}
            size="large"
            defaultValue={defaultValue}
            status={errors[name] ? "error" : undefined}
            className={`rounded-1xl mb-4 w-full`}
          />
        )}
      />
      {(errors?.message || errors?.[name]?.message) && (
        <p className="text-red-500 text-sm">
          {String(errors?.[name]?.message || errors?.message || " ")}
        </p>
      )}
    </div>
  );
};

export default FormDate;
