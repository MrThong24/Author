import { notification } from "antd";
import axios from "axios";
import { v4 } from "uuid";
import { getAccessTokenFromLS } from "./auth";

interface UploadResponse {
  file: {
    name: string;
    path: string;
    mimetype: string;
  };
}

interface UploadFileFnResponse {
  link: string;
}

export const uploadFileFn = async (
  file: File
): Promise<UploadFileFnResponse> => {
  const formData = new FormData();
  const filename = file?.name;
  const chunkIndex = "0";
  const totalChunks = "1";
  formData.append("file", file);
  formData.append("chunkIndex", chunkIndex);
  formData.append("totalChunks", totalChunks);
  formData.append("filename", filename);
  const token = getAccessTokenFromLS();
  try {
    const response = await axios.post<UploadResponse>(
      `${import.meta.env.VITE_MEDIA_SEVER_URL}/media/api/v1/file/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return {
      link: response.data?.file?.path,
    };
  } catch (error: any) {
    throw error;
  }
};
