import { Checkbox } from 'antd';
import { FC } from 'react';

const CustomCheckbox: FC = (props) => {
  return <Checkbox {...props} />;
};
const BaseCheckbox = Object.assign(Checkbox, CustomCheckbox);
export default BaseCheckbox;
