import {configureStore} from "@reduxjs/toolkit";
import {setupListeners} from "@reduxjs/toolkit/query";
import {api} from "./services/api";
import builderReducer from './services/builder';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    builder: builderReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware)
});

setupListeners(store.dispatch);
