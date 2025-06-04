import { Customers } from 'src/types/customer.type';
import { formatDate } from 'src/shared/utils/utils';

interface CardCustomerProps {
  customer: Customers;
  index: number;
}

const CardCustomer = ({ customer, index }: CardCustomerProps) => {
  return (
    <div
      className='flex gap-3 p-3 rounded-lg cursor-pointer items-center bg-white min-h-[70px]'
      style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}
    >
      <h2 className='font-medium text-primary'>{index + 1}</h2>
      <div className='flex justify-between items-center flex-1'>
        <div className='flex flex-col gap-1'>
          <h2 className='font-medium'>{customer?.name}</h2>
          {customer?.phone && <h2 className='font-light'>{customer?.phone}</h2>}
        </div>
        <h2 className='text-end'>{formatDate(customer.accessTime, true)}</h2>
      </div>
    </div>
  );
};

export default CardCustomer;
