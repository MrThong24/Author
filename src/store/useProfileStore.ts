import { notification } from 'antd';
import { RcFile } from 'antd/es/upload';
import { showError } from 'src/shared/utils/error';
import http from 'src/shared/utils/http';
import { uploadFileFn } from 'src/shared/utils/uploadFile';
import { ProfilePayload, StorePayload } from 'src/validate/userSchema';
import { create } from 'zustand';
import useAuthStore from './authStore';
import { Bank } from 'src/types/user.type';
interface ProfileStore {
  isLoading: boolean;
  banks: Bank[];
  updateProfile: ( payload: ProfilePayload, avatar: RcFile | string ) => Promise<void>;
}

const useProfileStore = create<ProfileStore>((set) => ({
  isLoading: false,
  banks: [],

  updateProfile: async ( data: ProfilePayload, avatar: RcFile | string ) => {
    set({ isLoading: true });
    try {
      let resFile;
      if (avatar && typeof avatar !== 'string') {
        resFile = await uploadFileFn(avatar as RcFile);
        avatar = resFile.link;
      }
      const response = await http.put(`/user/my`, { ...data, avatar });
      await useAuthStore.getState().getCurrentUser()
      set({ isLoading: false });
      notification.success({
        message: 'Chỉnh sửa thông tin tài khoản thành công'
      });
      return response.data;
    } catch (error) {
      showError({ error, title: 'Chỉnh sửa thông tin tài khoản thất bại' });
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useProfileStore;
