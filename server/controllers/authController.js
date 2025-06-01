import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5;
const LOCK_TIME = parseInt(process.env.LOCK_TIME, 10) || 30 * 60 * 1000; // ms

// Helper for token-based user actions
const handleTokenAction = async ({
  token,
  tokenField,
  expiresField,
  updateFields,
  errorMessage,
  saveOptions = {},
}) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    [tokenField]: hashedToken,
    [expiresField]: { $gt: Date.now() },
  });
  if (!user) {
    return { error: errorMessage };
  }
  Object.assign(user, updateFields);
  await user.save(saveOptions);
  return { user };
};

// Helper: Check if account is locked
function isAccountLocked(user) {
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return { locked: true, minutes };
  }
  return { locked: false };
}

// Helper: Handle failed login attempt
async function handleFailedLogin(user) {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    user.lockUntil = Date.now() + LOCK_TIME;
    await user.save({ validateBeforeSave: false });
    return { locked: true };
  }
  await user.save({ validateBeforeSave: false });
  return { locked: false };
}

// Helper: Check if email is verified
function isEmailVerified(user) {
  return !!user.isEmailVerified;
}

// Helper: Reset failed login attempts
async function resetFailedLogin(user) {
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });
}

export const register = async (req, res, next) => {
  try {
    const { firstName, secondName, email, password } = req.body;

    // Check for insecure password (add your own rules as needed)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(
        new AppError(
          'Password must be at least 8 characters and contain at least one letter and one number.',
          400,
        ),
      );
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered.', 409));
    }

    const user = await User.create({ firstName, secondName, email, password });
    const emailToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    // TODO: Send verification email with emailToken
    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new AppError(err.message, 400));
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Check if account is locked
    const lockStatus = isAccountLocked(user);
    if (lockStatus.locked) {
      return next(new AppError(`Account locked. Try again in ${lockStatus.minutes} minutes.`, 423));
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      const failedStatus = await handleFailedLogin(user);
      if (failedStatus.locked) {
        return next(
          new AppError(
            'Account locked due to too many failed login attempts. Try again in 30 minutes.',
            423,
          ),
        );
      }
      return next(new AppError('Incorrect email or password', 401));
    }

    await resetFailedLogin(user);

    if (!isEmailVerified(user)) {
      return next(new AppError('Please verify your email first.', 401));
    }
    const token = signToken(user._id);
    
    // Set cookie options based on rememberMe
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };
    
    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      cookieOptions.maxAge = 2 * 60 * 60 * 1000; // 2 hours
    }
    
    res.cookie('token', token, cookieOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { error, user } = await handleTokenAction({
      token: req.params.token,
      tokenField: 'emailVerificationToken',
      expiresField: 'emailVerificationExpires',
      updateFields: {
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
      },
      errorMessage: 'Token is invalid or has expired',
      saveOptions: { validateBeforeSave: false },
    });
    if (error) {
      return res.status(400).json({ message: error });
    }
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    const emailToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    // TODO: Send verification email with emailToken
    res.status(200).json({ message: 'Verification email resent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // TODO: Send password reset email with resetToken
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { error, user } = await handleTokenAction({
      token: req.params.token,
      tokenField: 'passwordResetToken',
      expiresField: 'passwordResetExpires',
      updateFields: {
        password: req.body.password,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      },
      errorMessage: 'Token is invalid or has expired',
      saveOptions: {},
    });
    if (error) {
      return res.status(400).json({ message: error });
    }
    const token = signToken(user._id);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({ message: 'Your current password is wrong.' });
    }
    user.password = req.body.newPassword;
    await user.save();
    const token = signToken(user._id);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true });
};
