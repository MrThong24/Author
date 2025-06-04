import useProductStore from 'src/store/useProductStore';
import { FaDownload } from 'react-icons/fa';
import { message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import BaseButton from 'src/shared/components/Buttons/Button';
import { useEffect, useState } from 'react';
import { RcFile } from 'antd/es/upload';
import { useWebView } from 'src/hooks/useWebView';
interface ExportAndImportProductProps {
  isUpdate: boolean;
}

export default function ExportAndImportProduct({ isUpdate }: ExportAndImportProductProps) {
  const { isImportLoading, exportProductTemplate, importProduct } = useProductStore();
  const [file, setFile] = useState<RcFile | null>(null);
  const isWebview = useWebView();
  return (
    <div>
      <div className='flex justify-between px-2 py-4 bg-white shadow-sm rounded-lg font-semibold mb-3'>
        <p>File mẫu</p>
        <div
          className='flex gap-x-2 text-primary cursor-pointer items-center'
          onClick={() =>
            exportProductTemplate(
              {
                isUpdate: isUpdate
              },
              isWebview
            )
          }
        >
          <FaDownload />
          Biểu mẫu excel
        </div>
      </div>
      <div className='px-2 py-4 bg-white shadow-sm rounded-lg font-semibold'>
        <div className='flex gap-x-4'>
          <p>File excel:</p>
          <Upload
            onRemove={(file) => {
              setFile(null);
            }}
            multiple={false}
            accept='.xlsx'
            beforeUpload={(file) => {
              const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              if (!isXlsx) {
                message.error('File không hợp lệ');
                return Upload.LIST_IGNORE;
              }
              const isLt5MB = file.size / 1024 / 1024 < 5;
              if (!isLt5MB) {
                message.error('Kích thước file tối đa là 5MB');
                return Upload.LIST_IGNORE;
              }
              setFile(file);
              return false;
            }}
            maxCount={1}
          >
            <BaseButton icon={<UploadOutlined />} variant='outlined'>
              Chọn tệp
            </BaseButton>
          </Upload>
        </div>
        <div className='text-right'>
          <BaseButton
            onClick={() => {
              if (file) importProduct(file, isUpdate);
            }}
            loading={isImportLoading}
            disabled={!file}
          >
            Nhập tệp tin
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
