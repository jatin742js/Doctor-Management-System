import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const billingApi = createApi({
  reducerPath: 'billingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Billing'],
  endpoints: (build) => ({
    getBills: build.query({ query: (params) => ({ url: '/billing', params }), providesTags: ['Billing'] }),
    getBill: build.query({ query: (id) => `/billing/${id}` , providesTags: ['Billing']}),
    createBill: build.mutation({ query: (body) => ({ url: '/billing', method: 'POST', body }), invalidatesTags: ['Billing'] }),
    updateBill: build.mutation({ query: ({ id, body }) => ({ url: `/billing/${id}`, method: 'PUT', body }), invalidatesTags: ['Billing'] }),
    deleteBill: build.mutation({ query: (id) => ({ url: `/billing/${id}`, method: 'DELETE' }), invalidatesTags: ['Billing'] }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
} = billingApi;
