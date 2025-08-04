import { configureStore } from "@reduxjs/toolkit";
import { storeReducer } from "./redux_/reducers/storeReducer";
import { cartReducer } from "./redux_/reducers/cartReducer";

const store = configureStore({
  reducer: {
    storeReducer,
    cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
