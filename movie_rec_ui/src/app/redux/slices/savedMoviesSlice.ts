import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Profile state
interface SavedMoviesState {
    movies: string[];
    year: string[];
    descriptions: string[];
}

// Set initial states
const initialState: SavedMoviesState = {
    movies: [""],
    year: [""],
    descriptions: [""],
};

// Reducers
const profileSlice = createSlice({
    name: 'savedMovies',
    initialState,
    reducers: {
        setMovies(state, action: PayloadAction<string[]>) { 
            state.movies = action.payload;
        },
        setYears(state, action: PayloadAction<string[]>) { 
            state.movies = action.payload;
        },
        setDescriptions(state, action: PayloadAction<string[]>) { 
            state.movies = action.payload;
        },
    },
});

// exports actions to use in app
export const {setMovies, setYears, setDescriptions} = profileSlice.actions; 
export default profileSlice.reducer; // exports reducer to handle actions