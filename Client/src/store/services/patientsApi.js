import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const patientsApi = createApi({
  reducerPath: 'patientsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Patients'],
  endpoints: (build) => ({
    getPatients: build.query({ query: (params) => ({ url: '/patients', params }), providesTags: ['Patients'] }),
    searchPatients: build.query({ query: (name) => ({ url: '/patients/search', params: { name } }), providesTags: ['Patients'] }),
    createPatient: build.mutation({ query: (body) => ({ url: '/patients/add', method: 'POST', body }), invalidatesTags: ['Patients'] }),
    updatePatient: build.mutation({ query: ({ id, body }) => ({ url: `/patients/${id}`, method: 'PUT', body }), invalidatesTags: ['Patients'] }),
    deletePatient: build.mutation({ query: (id) => ({ url: `/patients/${id}`, method: 'DELETE' }), invalidatesTags: ['Patients'] }),
  }),
});

export const {
  useGetPatientsQuery,
  useSearchPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientsApi;
