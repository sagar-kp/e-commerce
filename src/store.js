import { configureStore } from "@reduxjs/toolkit";
import { storeReducer } from "./redux_/reducers/storeReducer";

const store = configureStore({
  reducer:{
    storeReducer
  }
})

export default store
