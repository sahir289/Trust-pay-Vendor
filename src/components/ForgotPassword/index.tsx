/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from 'react';
import { FormInput, FormLabel } from '@/components/Base/Form';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import { userVerification, verifyOtp, resetPassword } from '@/redux-toolkit/slices/auth/authAPI';
import {
    NotificationElement,
  } from '@/components/Base/Notification';
import { Status } from '@/constants';
import { useAppSelector } from '@/redux-toolkit/hooks/useAppSelector';
import { addAllNotification, removeNotificationById } from '@/redux-toolkit/slices/AllNoti/allNotifications';
import { useAppDispatch } from '@/redux-toolkit/hooks/useAppDispatch';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword = ({ onBack, onSuccess }: ForgotPasswordProps) => {
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const notifications = useAppSelector((state) => state.allNotification.allNotifications);
  const notificationRefs = useRef<Map<string, NotificationElement>>(new Map());
  const dispatch = useAppDispatch();

   useEffect(() => {
        if (notifications.length > 0) {
          const latestNotification = notifications[notifications.length - 1];
          if (latestNotification) {
            const ref = notificationRefs.current.get(latestNotification.id);
          if (ref && latestNotification.id) {
            notificationRefs.current.forEach((_, id) => {
              if (id !== latestNotification.id) {
                dispatch(removeNotificationById(id));
                notificationRefs.current.delete(id);
              }
            });
            ref.showToast();
            setTimeout(() => {
              dispatch(removeNotificationById(latestNotification.id));
              notificationRefs.current.delete(latestNotification.id);
            }, 3000);
          }
        }}
      }, [notifications.length, dispatch]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await userVerification(email);

      if (response.meta.message === 'Verified User Successfully') {
        setStep('otp');
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'OTP sent to your email',
          })
        );
      } else {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: response.error.message || 'Failed to send OTP. Please try again.',
          })
        );
        setError('Failed to send OTP. Please try again.');
      }
    } catch {
      dispatch(
        addAllNotification({
          status: Status.ERROR,
            message: "Invalid User's Info",
          })
        );
      setError("Please Enter Valid User's Info");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await verifyOtp(otp);
        if (response?.data?.id) {
        setStep('newPassword');
        setUserId(response.data.id);
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'OTP verified successfully',
          })
        );
      } else {
        setError('Invalid OTP. Please try again.');
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: response.error.message || 'Invalid OTP. Please try again.',
          })
        );
      }
    } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Something went wrong. Please try again.',
          })
        );
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
        if (!userId) {
          setError('User ID is missing. Please try again.');
          return;
        }
        const response = await resetPassword(userId, newPassword);

      if (response.meta.message) {
        onSuccess();
        dispatch(
          addAllNotification({
            status: Status.SUCCESS,
            message: 'Password reset successful. Please login with your new password.',
          })
        );
      } else if (response.error) {
        setError(response.error.message || 'Failed to reset password. Please try again.');
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: response.error.message || 'Failed to reset password. Please try again.',
          })
        );
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch {
        dispatch(
          addAllNotification({
            status: Status.ERROR,
            message: 'Something went wrong. Please try again.',
          })
        );
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="flex items-center text-primary">
          <Lucide icon="ChevronLeft" className="w-4 h-4 mr-1" />
          Back to Login
        </button>
      </div>

      <div className="text-2xl font-medium mb-6">
        {step === 'email' && 'Forgot Password'}
        {step === 'otp' && 'Enter OTP'}
        {step === 'newPassword' && 'Reset Password'}
      </div>

      {step === 'email' && (
        <form onSubmit={handleEmailSubmit}>
          <FormLabel>User Name</FormLabel>
          <FormInput
            type="text"
            className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
            placeholder="Enter your Registered username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
                {error && <div className="text-danger mt-4 text-sm">{error}</div>}

          <Button
            variant="primary"
            rounded
            disabled={loading}
            className="w-full mt-4 py-3.5"
            type="submit"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit}>
          <FormLabel>Enter OTP</FormLabel>
          <FormInput
            type="text"
            className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
            placeholder="Enter OTP sent to your email"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
                {error && <div className="text-danger mt-4 text-sm">{error}</div>}

          <Button
            variant="primary"
            rounded
            disabled={loading}
            className="w-full mt-4 py-3.5"
            type="submit"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      )}

      {step === 'newPassword' && (
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <FormLabel>New Password</FormLabel>
              <div className="relative">
                <FormInput
                  type={showPassword ? 'text' : 'password'}
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Lucide
                    icon={showPassword ? 'Eye' : 'EyeOff'}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>

            <div>
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <FormInput
                  type={showPassword ? 'text' : 'password'}
                  className="block px-4 py-3.5 rounded-[0.6rem] border-slate-300/80"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute right-4 top-4 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Lucide
                    icon={showPassword ? 'Eye' : 'EyeOff'}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </div>
      {error && <div className="text-danger mt-4 text-sm">{error}</div>}

          <Button
            variant="primary"
            rounded
            disabled={loading}
            className="w-full mt-6 py-3.5"
            type="submit"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}

    </div>
  );
};

export default ForgotPassword;
