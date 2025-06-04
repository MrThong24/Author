import { useNavigate } from 'react-router-dom';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import ExportAndImportProduct from './ExportAndImportProduct/ExportAndImportProduct';

export default function ImportProduct() {
  const navigate = useNavigate();

  return (
    <DetailHeader title={`Import sản phẩm`} handleBack={() => navigate(-1)}>
      <ExportAndImportProduct isUpdate={true} />
    </DetailHeader>
  );
}
