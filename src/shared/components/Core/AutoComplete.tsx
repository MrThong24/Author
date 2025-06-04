import { AutoComplete } from 'antd';
import { FC } from 'react';

const CustomAutoComplete: FC = (props) => {
  return <AutoComplete {...props} />;
};
const BaseAutoComplete = Object.assign(AutoComplete, CustomAutoComplete);
export default BaseAutoComplete;
