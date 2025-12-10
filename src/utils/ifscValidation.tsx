/* eslint-disable @typescript-eslint/no-explicit-any */
// import { debounce } from "lodash";
import axios from "axios";

export const debouncedValidateIfscCode = 
  async (ifsc: string): Promise<boolean> => {
    try {
     await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
      return true; // IFSC is valid
    } catch  {
      return false; // Invalid IFSC
    }
  } // 500ms debounce time
