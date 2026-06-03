import { yup } from '@/lib/forms';

/** Sign-up details (screen 1): identity + phone + address + password. */
export const signupSchema = yup.object({
  /** Optional profile picture (local device URI). */
  photo: yup.string().optional(),
  fullName: yup.string().required('Full name is required').min(2, 'Too short'),
  phone: yup.string().required('Mobile number is required').length(10, 'Enter a 10-digit number'),
  address: yup.string().required('Address is required').min(3, 'Too short'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Use at least 8 characters')
    .matches(/[a-z]/, 'Add a lowercase letter')
    .matches(/[A-Z]/, 'Add an uppercase letter')
    .matches(/[0-9]/, 'Add a number')
    .matches(/[^A-Za-z0-9]/, 'Add a special character'),
  confirmPassword: yup
    .string()
    .required('Confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

export type SignupFormValues = yup.InferType<typeof signupSchema>;

/** Login: phone + password. */
export const loginSchema = yup.object({
  phone: yup.string().required('Mobile number is required').length(10, 'Enter a 10-digit number'),
  password: yup.string().required('Password is required'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

/** Forgot password: just the phone number we text a reset code to. */
export const forgotPasswordSchema = yup.object({
  phone: yup.string().required('Mobile number is required').length(10, 'Enter a 10-digit number'),
});

export type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>;

/** OTP verification: a 6-digit numeric code. */
export const verifyOtpSchema = yup.object({
  code: yup
    .string()
    .required('Enter the 6-digit code')
    .matches(/^\d{6}$/, 'Enter the 6-digit code'),
});

export type VerifyOtpFormValues = yup.InferType<typeof verifyOtpSchema>;
