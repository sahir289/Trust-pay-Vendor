import { RootState } from '../../../store/store';

// export const getPaginationData = (state: RootState) => {
//   // Provide default values if state.pagination is undefined
//   if (!state.pagination) {
//     return {
//         page: 1,
//         limit: 10
//     };
//   }
//   return state.pagination;
// };

export const getPaginationData = (state: RootState) => state.params.params;
