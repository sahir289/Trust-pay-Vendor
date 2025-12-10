/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
