// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { themes, getTheme } from "./themeUtils";
// import { Themes } from "./themeTypes";

// interface ThemeState {
//   value: Themes["name"];
// }

// const initialState: ThemeState = {
//   value:
//     localStorage.getItem("theme") === null ? themes[0].name : getTheme().name,
// };

// const themeSlice = createSlice({
//   name: "theme",
//   initialState,
//   reducers: {
//     setTheme: (state, action: PayloadAction<Themes["name"]>) => {
//       state.value = action.payload;
//       localStorage.setItem("theme", action.payload);
//     },
//   },
// });

// export const { setTheme } = themeSlice.actions;
// export default themeSlice.reducer;
