import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const prescriptionsApi = createApi({
  reducerPath: 'prescriptionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Prescriptions'],
  endpoints: (build) => ({
    getPrescriptions: build.query({ query: (params) => ({ url: '/prescriptions', params }), providesTags: ['Prescriptions'] }),
    createPrescription: build.mutation({ query: (body) => ({ url: '/prescriptions/add', method: 'POST', body }), invalidatesTags: ['Prescriptions'] }),
    updatePrescription: build.mutation({ query: ({ id, body }) => ({ url: `/prescriptions/${id}`, method: 'PUT', body }), invalidatesTags: ['Prescriptions'] }),
    deletePrescription: build.mutation({ query: (id) => ({ url: `/prescriptions/${id}`, method: 'DELETE' }), invalidatesTags: ['Prescriptions'] }),
    getMedicineNames: build.query({ query: () => '/prescriptions/medicines/names' }),
  }),
});

export const {
  useGetPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
  useGetMedicineNamesQuery,
} = prescriptionsApi;
