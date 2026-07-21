import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Dashboard', 'Reports'],
  endpoints: (build) => ({
    getDashboard: build.query({ query: () => '/dashboard', providesTags: ['Dashboard'] }),
    markReportRead: build.mutation({ query: (id) => ({ url: `/reports/${id}/read`, method: 'POST' }), invalidatesTags: ['Dashboard','Reports'] }),
  }),
});

export const {
  useGetDashboardQuery,
  useMarkReportReadMutation,
} = dashboardApi;
