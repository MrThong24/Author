import { DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

dayjs.locale('vi', {
  ...dayjs.Ls['vi'],
  monthsShort: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12']
});

interface BaseDatePickerProps {
  props: DatePickerProps;
  className?: string;
}

export const BaseDatePicker = ({ className, ...props }: BaseDatePickerProps) => {
  return <DatePicker className={className} {...props} />;
};

BaseDatePicker.RangePicker = DatePicker.RangePicker;
