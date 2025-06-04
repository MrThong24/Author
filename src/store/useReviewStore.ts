import { message } from 'antd';
import { TFunction } from 'i18next';
import { showError } from 'src/shared/utils/error';
import http from 'src/shared/utils/http';
import { Params } from 'src/types/params.type';
import { create } from 'zustand';
export interface Review {
  id: string;
  createdAt: string;
  content: string;
  customer: {
    id: string;
    name: string;
  };
  tableName?: string;
  zoneName?: string;
  ratingCriteria: {
    id: string;
    criteria: {
      id: string;
      name: string;
    };
    star: number;
  }[];
}

export interface ReviewPayload {
  content: string;
  customerName: string;
  tableName: string;
  zoneName: string;
  ratingCriteria: {
    star: number;
    criteriaId: string;
  }[];
}

export interface FilterReview extends Params {
  search?: string;
  star?: number;
  criteriaId?: string[];
}

interface ReviewStore {
  reviews: Review[];
  average: {
    id: string;
    name: string;
    averageStars: number;
  }[];
  critierias: {
    id: string;
    name: string;
    description: string;
  }[];
  critieriasPublic: {
    id: string;
    name: string;
    description: string;
  }[];
  total: number;
  isLoading: boolean;
  isLoadingDetail: boolean;
  reviewDetail: Review | null;
  createReview: (data: ReviewPayload, t: TFunction) => Promise<void>;
  fetchReviews: (params: FilterReview, getOnly?: boolean) => Promise<void>;
  fetchCritieriasPublic: () => Promise<void>;
  fetchCritierias: () => Promise<void>;
  fetchReviewDetail: (id: string) => Promise<void>;
  fetchAverage: () => Promise<void>;
}

const useReviewStore = create<ReviewStore>((set) => ({
  reviews: [],
  total: 0,
  isLoading: false,
  isLoadingDetail: false,
  critierias: [],
  critieriasPublic: [],
  average: [],
  reviewDetail: null,
  fetchReviews: async (params: FilterReview, getOnly?: boolean) => {
    if (!getOnly) {
      set({ isLoading: true });
    }
    try {
      const queryParams = new URLSearchParams();
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }
      if (params.star) {
        queryParams.append('star', params.star.toString());
      }
      if (params.criteriaId) {
        params.criteriaId.forEach((id) => queryParams.append('criteriaId', id));
      }
      const response = await http.get('/rating', { params: queryParams });
      if (!getOnly) {
        set({
          reviews: response.data.data,
          total: response.data.totalItems,
          isLoading: false
        });
      }
      return response.data;
    } catch (error) {
      showError({ error, title: 'Lấy thông tin đánh giá thất bại' });
      set({ isLoading: false });
    }
  },

  createReview: async (data: ReviewPayload, t: TFunction) => {
    set({ isLoading: true });
    try {
      await http.post('/public/rating', data);
      set({ isLoading: false });
      message.success(t('message.thankyouForReview'));
    } catch (error) {
      showError({ error, title: t('message.failedToSubmitReview') });
      set({ isLoading: false });
    }
  },

  fetchCritieriasPublic: async () => {
    try {
      const response = await http.get('/public/rating/criteria');
      set({ critieriasPublic: response.data });
    } catch (error) {}
  },

  fetchCritierias: async () => {
    try {
      const response = await http.get('/rating/criteria');
      set({ critierias: response.data });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin tiêu chí đánh giá thất bại' });
    }
  },

  fetchReviewDetail: async (id: string) => {
    set({ isLoadingDetail: true });
    try {
      const response = await http.get(`/rating/${id}`);
      set({ reviewDetail: response.data, isLoadingDetail: false });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin đánh giá thất bại' });
      set({ isLoadingDetail: false });
    }
  },

  fetchAverage: async () => {
    try {
      const response = await http.get('/rating/average');
      set({ average: response.data });
    } catch (error) {
      showError({ error, title: 'Lấy thông tin đánh giá trung bình thất bại' });
    }
  }
}));

export default useReviewStore;
