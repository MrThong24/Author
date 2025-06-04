import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Request from './Request';

const RequestTypeWrapper = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [prevType, setPrevType] = useState(type);

  useEffect(() => {
    if (prevType && type !== prevType) {
      navigate(`/request/${type}`, {
        replace: true,
        state: { resetFilters: true }
      });
    }
    setPrevType(type);
  }, [type]);

  return <Request />;
};

export default RequestTypeWrapper;
