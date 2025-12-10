/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RootState } from '../../store/store';

// Select the entire list of roles
export const getAllRoleData = (state: RootState) => state.role;
