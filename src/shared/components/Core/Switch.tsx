import { Switch } from 'antd';
import { FC } from 'react';

const CustomSwitch: FC = (props) => {
  return <Switch {...props} />;
};
const BaseSwitch = Object.assign(Switch, CustomSwitch);
export default BaseSwitch;
