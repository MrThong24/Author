import { Select } from 'antd';
import { FC } from 'react';

const CustomSelect: FC = (props) => {
  return <Select {...props} />;
};
const BaseSelect = Object.assign(Select, CustomSelect);

export default BaseSelect;
