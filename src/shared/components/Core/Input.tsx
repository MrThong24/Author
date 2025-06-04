import type { FC } from 'react';
import { Input } from 'antd';

const CustomInput: FC = (props) => {
  return <Input {...props} />;
};

const BaseInput = Object.assign(Input, CustomInput);

export default BaseInput;
