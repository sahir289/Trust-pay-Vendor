/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from '../../store/store';

// Select the entire list of designations
export const getAllDesignationData = (state: RootState) => state.designation;
