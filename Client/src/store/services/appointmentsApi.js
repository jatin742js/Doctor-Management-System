import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const appointmentsApi = createApi({
  reducerPath: 'appointmentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Appointments'],
  endpoints: (build) => ({
    getAppointments: build.query({ query: (params) => ({ url: '/appointments', params }), providesTags: ['Appointments'] }),
    createAppointment: build.mutation({ query: (body) => ({ url: '/appointments', method: 'POST', body }), invalidatesTags: ['Appointments'] }),
    updateAppointment: build.mutation({ query: ({ id, body }) => ({ url: `/appointments/${id}`, method: 'PUT', body }), invalidatesTags: ['Appointments'] }),
    deleteAppointment: build.mutation({ query: (id) => ({ url: `/appointments/${id}`, method: 'DELETE' }), invalidatesTags: ['Appointments'] }),
    addPatientToAppointment: build.mutation({ query: ({ id }) => ({ url: `/appointments/${id}/add-patient`, method: 'PATCH' }), invalidatesTags: ['Appointments','Patients'] }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useAddPatientToAppointmentMutation,
} = appointmentsApi;
