import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (build) => ({
    login: build.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }), invalidatesTags: ['Auth'] }),
    register: build.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }), invalidatesTags: ['Auth'] }),
    forgotPassword: build.mutation({ query: (body) => ({ url: '/forget-password', method: 'POST', body }), invalidatesTags: ['Auth'] }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
} = authApi;
