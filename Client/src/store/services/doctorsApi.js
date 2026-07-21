import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const doctorsApi = createApi({
  reducerPath: 'doctorsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Doctors'],
  endpoints: (build) => ({
    getDoctors: build.query({ query: (params) => ({ url: '/doctors', params }), providesTags: ['Doctors'] }),
    searchDoctors: build.query({ query: (name) => ({ url: '/doctors/search', params: { name } }) , providesTags: ['Doctors']}),
    createDoctor: build.mutation({ query: (body) => ({ url: '/doctors', method: 'POST', body }), invalidatesTags: ['Doctors'] }),
    updateDoctor: build.mutation({ query: ({ id, body }) => ({ url: `/doctors/${id}`, method: 'PUT', body }), invalidatesTags: ['Doctors'] }),
    deleteDoctor: build.mutation({ query: (id) => ({ url: `/doctors/${id}`, method: 'DELETE' }), invalidatesTags: ['Doctors'] }),
  }),
});

export const {
  useGetDoctorsQuery,
  useSearchDoctorsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorsApi;
