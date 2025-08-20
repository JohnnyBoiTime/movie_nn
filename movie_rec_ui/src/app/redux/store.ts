import { configureStore } from "@reduxjs/toolkit";
import {persistStore, persistReducer} from "redux-persist"
import storage from "redux-persist/lib/storage" 
import profileReducer from "./slices/profileSlice"

const profilePersistConfig = {
    key: 'profile', // Store as profile
    storage, // stored in localStorage in browser
    whitelist: ['username'], // Username persists through refresh

}

const savedMoviesPersistConfig = {
    key: ''
}

// On app load, merges profile information from the storage to the 
// profile
const peristedProfileReducer = persistReducer(profilePersistConfig, profileReducer);



// Create the store
export const makeStore = configureStore({
    reducer: {
        profile: peristedProfileReducer,
    },

    // redux-persist writes non-serializable data, so 
    // allows redux-persist own actions to work 
    // without triggering warnings
    middleware: getDefaultMiddleware => 
        getDefaultMiddleware({ serializableCheck: false })
})


// On app load, looks into storage under the set key to
// dispatch the whitelist to the slice
export const persistor = persistStore(makeStore)

// Infer the type of makeStore
export type AppStore = typeof makeStore
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']