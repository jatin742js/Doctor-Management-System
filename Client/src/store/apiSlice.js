import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    'Reports',
    'Doctors',
    'Patients',
    'Appointments',
    'Billing',
    'Prescriptions',
    'Settings',
    'Dashboard',
    'Auth',
  ],
  endpoints: (build) => ({
    // Reports
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

    // Doctors
    getDoctors: build.query({ query: (params) => ({ url: '/doctors', params }), providesTags: ['Doctors'] }),
    searchDoctors: build.query({ query: (name) => ({ url: '/doctors/search', params: { name } }) , providesTags: ['Doctors']}),
    createDoctor: build.mutation({ query: (body) => ({ url: '/doctors', method: 'POST', body }), invalidatesTags: ['Doctors'] }),
    updateDoctor: build.mutation({ query: ({ id, body }) => ({ url: `/doctors/${id}`, method: 'PUT', body }), invalidatesTags: ['Doctors'] }),
    deleteDoctor: build.mutation({ query: (id) => ({ url: `/doctors/${id}`, method: 'DELETE' }), invalidatesTags: ['Doctors'] }),

    // Patients
    getPatients: build.query({ query: (params) => ({ url: '/patients', params }), providesTags: ['Patients'] }),
    searchPatients: build.query({ query: (name) => ({ url: '/patients/search', params: { name } }), providesTags: ['Patients'] }),
    createPatient: build.mutation({ query: (body) => ({ url: '/patients', method: 'POST', body }), invalidatesTags: ['Patients'] }),
    updatePatient: build.mutation({ query: ({ id, body }) => ({ url: `/patients/${id}`, method: 'PUT', body }), invalidatesTags: ['Patients'] }),
    deletePatient: build.mutation({ query: (id) => ({ url: `/patients/${id}`, method: 'DELETE' }), invalidatesTags: ['Patients'] }),

    // Appointments
    getAppointments: build.query({ query: (params) => ({ url: '/appointments', params }), providesTags: ['Appointments'] }),
    createAppointment: build.mutation({ query: (body) => ({ url: '/appointments', method: 'POST', body }), invalidatesTags: ['Appointments'] }),
    updateAppointment: build.mutation({ query: ({ id, body }) => ({ url: `/appointments/${id}`, method: 'PUT', body }), invalidatesTags: ['Appointments'] }),
    deleteAppointment: build.mutation({ query: (id) => ({ url: `/appointments/${id}`, method: 'DELETE' }), invalidatesTags: ['Appointments'] }),
    addPatientToAppointment: build.mutation({ query: ({ id }) => ({ url: `/appointments/${id}/add-patient`, method: 'PATCH' }), invalidatesTags: ['Appointments','Patients'] }),

    // Billing
    getBills: build.query({ query: (params) => ({ url: '/billing', params }), providesTags: ['Billing'] }),
    getBill: build.query({ query: (id) => `/billing/${id}` , providesTags: ['Billing']}),
    createBill: build.mutation({ query: (body) => ({ url: '/billing', method: 'POST', body }), invalidatesTags: ['Billing'] }),
    updateBill: build.mutation({ query: ({ id, body }) => ({ url: `/billing/${id}`, method: 'PUT', body }), invalidatesTags: ['Billing'] }),
    deleteBill: build.mutation({ query: (id) => ({ url: `/billing/${id}`, method: 'DELETE' }), invalidatesTags: ['Billing'] }),

    // Prescriptions
    getPrescriptions: build.query({ query: (params) => ({ url: '/prescriptions', params }), providesTags: ['Prescriptions'] }),
    createPrescription: build.mutation({ query: (body) => ({ url: '/prescriptions/add', method: 'POST', body }), invalidatesTags: ['Prescriptions'] }),
    updatePrescription: build.mutation({ query: ({ id, body }) => ({ url: `/prescriptions/${id}`, method: 'PUT', body }), invalidatesTags: ['Prescriptions'] }),
    deletePrescription: build.mutation({ query: (id) => ({ url: `/prescriptions/${id}`, method: 'DELETE' }), invalidatesTags: ['Prescriptions'] }),
    getMedicineNames: build.query({ query: () => '/prescriptions/medicines/names' }),

    // Settings
    getSettings: build.query({ query: () => '/settings', providesTags: ['Settings'] }),
    updateSettings: build.mutation({ query: (body) => ({ url: '/settings/update', method: 'POST', body }), invalidatesTags: ['Settings'] }),

    // Dashboard
    getDashboard: build.query({ query: () => '/dashboard', providesTags: ['Dashboard'] }),
    markReportRead: build.mutation({ query: (id) => ({ url: `/reports/${id}/read`, method: 'POST' }), invalidatesTags: ['Dashboard','Reports'] }),

    // Auth
    login: build.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }), invalidatesTags: ['Auth'] }),
    register: build.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }), invalidatesTags: ['Auth'] }),
    forgotPassword: build.mutation({ query: (body) => ({ url: '/forget-password', method: 'POST', body }), invalidatesTags: ['Auth'] }),
  }),
});

export const {
  // Reports
  useGetReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useUploadReportFileMutation,
  useGetPresignedUrlQuery,
  useSearchReportTitlesQuery,
  // Doctors
  useGetDoctorsQuery,
  useSearchDoctorsQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  // Patients
  useGetPatientsQuery,
  useSearchPatientsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  // Appointments
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useAddPatientToAppointmentMutation,
  // Billing
  useGetBillsQuery,
  useGetBillQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  // Prescriptions
  useGetPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
  useGetMedicineNamesQuery,
  // Settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  // Dashboard
  useGetDashboardQuery,
  useMarkReportReadMutation,
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
} = api;

export default api;
