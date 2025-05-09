// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import cartSlice from "./cartSlice";
// import storage from "redux-persist/lib/storage";
// import { persistReducer, persistStore } from "redux-persist";

// const persistConfig = {
//   key: "root",
//   storage,
// };

// const rootReducer = combineReducers({
//   cart: persistReducer(persistConfig, cartSlice),
// });

// export const store = configureStore({
//   reducer: rootReducer,
//   devTools: true, // Bật Redux DevTools
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, 
//     }),
// });

// export const persistor = persistStore(store);

// // Kiểu dữ liệu cho Redux
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cartSlice"; // Đảm bảo import đúng

export const store = configureStore({
  reducer: {
    cart: cartSlice, // Phải truyền `cartReducer`, không phải `cartSlice`
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;