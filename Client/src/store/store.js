import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { reportsApi } from './services/reportsApi';
import { doctorsApi } from './services/doctorsApi';
import { patientsApi } from './services/patientsApi';
import { appointmentsApi } from './services/appointmentsApi';
import { billingApi } from './services/billingApi';
import { prescriptionsApi } from './services/prescriptionsApi';
import { settingsApi } from './services/settingsApi';
import { dashboardApi } from './services/dashboardApi';
import { authApi } from './services/authApi';

export const store = configureStore({
  reducer: {
    [reportsApi.reducerPath]: reportsApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
    [patientsApi.reducerPath]: patientsApi.reducer,
    [appointmentsApi.reducerPath]: appointmentsApi.reducer,
    [billingApi.reducerPath]: billingApi.reducer,
    [prescriptionsApi.reducerPath]: prescriptionsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(
        reportsApi.middleware,
        doctorsApi.middleware,
        patientsApi.middleware,
        appointmentsApi.middleware,
        billingApi.middleware,
        prescriptionsApi.middleware,
        settingsApi.middleware,
        dashboardApi.middleware,
        authApi.middleware
      ),
});

setupListeners(store.dispatch);

export default store;
