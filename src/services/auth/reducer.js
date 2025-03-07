import {createSlice, nanoid} from "@reduxjs/toolkit";

const initialState = {
    user: null,
}

//export const setUser = createAction("auth/setUser");

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: {
            reducer: (state, action) => {
                state.user = action.payload;
            },
            prepare: (user) => {
                return { payload: { ...user, key: nanoid() }};
            }
        }
    },
    // extraReducers: (builder) => {
    //     builder.addCase(setUser, (state, action) => {
    //         state.user = action.payload;
    //     })
    // }
});

export const {setUser} = authSlice.actions;