import React from "react";
import {
  Control,
  FieldErrors,
  UseFormClearErrors,
  UseFormSetValue,
} from "react-hook-form";
import Field from "src/shared/components/Core/Field";
import Label from "src/shared/components/Core/Label";
import FormInput from "src/shared/components/Form/FormInput";
import { CategoryPayload } from "src/validate/categorySchema";

interface CategoryForm {
  control: Control<CategoryPayload>;
  errors: FieldErrors<CategoryPayload>;
  loading: boolean;
  setValue: UseFormSetValue<CategoryPayload>;
  clearErrors: UseFormClearErrors<CategoryPayload>;
}
export default function CategoryForm({
  control,
  errors,
  loading,
  setValue,
}: CategoryForm) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-2">Thông tin API</h2>
      <div className="flex flex-col md:flex-row gap-x-10">
        <Field>
          <Label text="Url" className="text-sm" validate={true} />
          <FormInput
            control={control}
            errors={errors}
            name="url"
            placeholder="Nhập url"
            size="large"
            disabled={false}
          />
        </Field>
        <Field>
          <Label text="Endpoint" className="text-sm" validate={true} />
          <FormInput
            control={control}
            errors={errors}
            name="endpoint"
            placeholder="Nhập endpoint"
            size="large"
            disabled={false}
          />
        </Field>
      </div>
      <div className="mt-4 md:mt-10">
        <Label text="Mô tả" validate={false} />
        <FormInput
          type="textarea"
          disabled={loading}
          control={control}
          name="description"
          placeholder="Mô tả"
          errors={errors}
          size="large"
        />
      </div>
    </div>
  );
}
