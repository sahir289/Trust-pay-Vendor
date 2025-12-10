/* eslint-disable @typescript-eslint/explicit-function-return-type */
import api from '../../services/api';

interface LoginResponse {
  error?: {
    message: string;
    name: string;
    statusCode: number;
  };
  loading?: boolean;
  meta?: {
    message: string;
  };
  data?: {
    accessToken: string;
    sessionId: string;
    user?: {
      id: string;
      email: string;
      name: string;
    };
    isLoginFirst?: boolean;
  };
}

interface LoginParams {
  username: string;
  password: string;
  newPassword?: string;
  isAdminLogin?: boolean;
  unique_admin_id?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getAccurateLocation(): Promise<UserLocation> {
  const permission = await navigator.permissions
    .query({ name: "geolocation" as PermissionName })
    .catch(() => null);
    
  console.log(permission, "Permission status");

  const getPosition = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 20000,      
          maximumAge: 0,
        }
      );
    });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const pos = await getPosition();

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (err: any) {
      const code = err.code;

      if (code === 1) {
        if (attempt < 3) {
          await new Promise(res => setTimeout(res, attempt === 1 ? 1000 : 2000));
          continue;
        }

        throw new Error(
          "Location access was denied. Please make sure location services are enabled and permission is allowed."
        );
      }

      if (attempt < 2) {
        await new Promise(res => setTimeout(res, 1000));
        continue;
      }

      throw new Error("Unable to retrieve your location. Please check your connection or GPS.");
    }
  }

  throw new Error("Failed to get location after multiple attempts.");
}

export const loginUser = async ({
  username,
  password,
  newPassword,
  unique_admin_id
}: LoginParams): Promise<LoginResponse> => {
  let user_location: UserLocation | null = null;

  try {
    user_location = await getAccurateLocation();
    console.log(user_location, "User location obtained");
  } catch (error:any) {
    console.log(error.message, "Location error ++++++++");
    let message = "";

    if (error.message.includes("denied")) {
      message += " You denied location permission. Please allow it and try again.";
    } else {
      message += " Please enable GPS/location services and allow location access ";
    }

    return {
      error: {
        message,
        name: "LocationError",
        statusCode: 400,
      },
    };
  }

  let payload: { username: string; password: string; newPassword?: string,  unique_admin_id?: string,
     user_location: UserLocation;
  } = {
    username,
    password,
    user_location,
  };

  if(unique_admin_id !== undefined) {
    payload = {
      ...payload,
      unique_admin_id

    };
  }
  if (newPassword !== undefined) {
    payload = {
      ...payload,
      newPassword,
    };
  }
  try {
    const response = await api.post('/auth/login', payload);
    // No hard refresh - let React Router handle navigation
    // This allows Redux state to persist and role-based UI to work properly
    return response.data;
  } catch (error) {
    return {
      error: {
        message: 'Server encountered problem!',
        name: (error as Error).name || 'Error',
        statusCode: (error as { status?: number }).status || 500,
      },
    };
  }
};

interface LogoutParams {
  session_id: string;
}

export const logOutUser = async ({ session_id }: LogoutParams) => {
  const response = await api.post('/auth/logout', { session_id });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('userSession');
  localStorage.removeItem('activeTab');
  localStorage.removeItem('parentTab');
  localStorage.removeItem('allowPayAssist');
  localStorage.removeItem('allowTataPay');
  localStorage.removeItem('allowClickrr');
  return response.data;
};
// export const logOutUser = (): AppThunk => async (dispatch) => {
//   try {
//     await api.post('/auth/logout');
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('userData');
//     dispatch(logout());
//     socketService.disconnect();
//   } catch (error) {
//     console.error('Logout failed:', error);
//     dispatch(logout()); // Clear state even if API fails
//     socketService.disconnect();
//   }
// };

export const changePassword = async ({ password, oldPassword }: { password: string; oldPassword: string }) => {
  const response = await api.post('/auth/change-password', { password, oldPassword });
  return response.data;
};

export const verifyPassword = async (password: string) => {
  const response = await api.post('/auth/password-verification', { password });
  if (response.data.error?.message) {
    throw new Error(response.data.error.message);
  }
  return response.data;
};

export const userVerification = async (email: string) => {
  const response = await api.post('/auth/user_verification', { user_name:email });
  return response.data;
};

export const verifyOtp = async ( otp: string) => {
  const response = await api.post('/auth/otp_verification', { otp });
  return response.data;
};
export const resetPassword = async ( user_id: string, password: string) => {
  const response = await api.post('/auth/reset_password', {user_id, password});
  return response.data;
}

export const getCompanyDetails = async (companyId: string) => {
  try {
    const response = await api.get(`/company/${companyId}`);
    return response.data;
  } catch (error) {
    return {
      error: {
        message: (error as Error).message || 'An error occurred',
        name: (error as Error).name || 'Error',
        statusCode: (error as { status?: number }).status || 500,
      },
    };
  }
};

export const getUserRoleDetails = async (username: string) => {
  try {
    const response = await api.get(`/auth/get-user-role?userName=${username}`);
    return response.data;
  } catch (error) {
    return {
      error: {
        message: 'Server encountered an issue',
        name: (error as Error).name || 'Error',
        statusCode: (error as { status?: number }).status || 500,
      },
    };
  }
};
