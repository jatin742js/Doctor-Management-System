import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Reports'],
  endpoints: (build) => ({
    getReports: build.query({
      query: () => '/reports',
      providesTags: ['Reports'],
    }),
    createReport: build.mutation({
      query: (body) => ({ url: '/reports', method: 'POST', body }),
      invalidatesTags: ['Reports'],
    }),
    updateReport: build.mutation({
      query: ({ id, body }) => ({ url: `/reports/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Reports'],
    }),
    deleteReport: build.mutation({
      query: (id) => ({ url: `/reports/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Reports'],
    }),
    // uploadReportFile: build.mutation({
    //   query: ({ id, formData }) => ({ url: `/reports/upload/${id}`, method: 'POST', body: formData }),
    //   invalidatesTags: ['Reports'],
    // }),
    // getPresignedUrl: build.query({
    //   query: (id) => `/reports/presign/${id}`,
    // }),
    searchReportTitles: build.query({
      query: (title) => ({ url: '/reports/titles', params: { title } }),
    }),
  }),
});

export const {
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useUploadReportFileMutation,
  // useGetPresignedUrlQuery,
  // useLazyGetPresignedUrlQuery,
  useSearchReportTitlesQuery,
} = reportsApi;
