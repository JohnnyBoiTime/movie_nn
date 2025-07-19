import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Profile state
interface ProfileState {
    username: string;
}

// Set initial states
const initialState: ProfileState = {
    username: '',
};

// Reducers
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setUsername(state, action: PayloadAction<string>) { 
            state.username = action.payload;
        },
    },
});

// exports actions to use in app
export const {setUsername} = profileSlice.actions; 
export default profileSlice.reducer; // exports reducer to handle actions