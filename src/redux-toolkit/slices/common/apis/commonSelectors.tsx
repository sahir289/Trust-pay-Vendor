import { RootState } from "../../../store/store";
 import { Count } from "./commonTypes";
 
 export const selectCountUsers = (state: RootState): Count => state.count