import React, { useState, useRef } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPassword } from '../../services/auth';
import { useFormGsapAnimation } from '../../animation/useFormGsapAnimation';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // GSAP refs
  const formRef = useRef<any>(null);
  const emailFieldRef = useRef<any>(null);
  const submitButtonRef = useRef<any>(null);
  const rememberPasswordRef = useRef<any>(null);

  // Apply GSAP animation
  useFormGsapAnimation({
    formRef,
    fieldRefs: [emailFieldRef],
    buttonRef: submitButtonRef,
    extraRefs: [rememberPasswordRef],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await forgotPassword(email);
      const successMessage = 'Password reset email sent! Check your inbox.';
      setMessage({
        type: 'success',
        text: successMessage,
      });
      // Clear form
      setEmail('');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box ref={formRef} sx={{ width: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: 'black',
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '1.7rem', md: '2rem' },
          fontWeight: 700,
        }}
      >
        Forgot Password?
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 3,
          color: 'black',
          opacity: 0.6,
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '0.95rem', md: '1.1rem' },
        }}
      >
        Enter your email and we'll send you a reset link
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box ref={emailFieldRef} sx={{ mb: 2 }}>
          <Typography
            htmlFor="email"
            component="label"
            sx={{
              mb: 1,
              display: 'block',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 600,
              color: 'black',
            }}
          >
            Email
          </Typography>
          <TextField
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: '#f7f8fa',
                boxShadow: 'none',
                transition: 'border-color 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1.5px',
                borderColor: '#e0e3e7',
                transition: 'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#036CA3',
                borderWidth: '2.5px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#036CA3',
                borderWidth: '2.5px',
              },
              input: {
                px: 2,
                py: 0,
                height: { xs: 44, md: 48 },
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                background: 'transparent',
                color: '#222',
                fontWeight: 500,
                letterSpacing: 0.01,
              },
            }}
          />
        </Box>

        <Button
          ref={submitButtonRef}
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 600,
            height: { xs: 44, md: 48 },
            borderRadius: 2,
            transition: 'box-shadow 0.3s, background 0.3s, transform 0.2s',
            boxShadow: '0 2px 8px 0 rgba(3,108,163,0.08)',
            '&:hover': {
              background: 'primary.dark',
              boxShadow: '0 4px 16px 0 rgba(3,108,163,0.15)',
              transform: 'translateY(-2px) scale(1.03)',
            },
            '&:active': {
              background: 'primary.main',
              boxShadow: '0 2px 8px 0 rgba(3,108,163,0.12)',
              transform: 'scale(0.98)',
            },
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </Box>

      <Typography ref={rememberPasswordRef} sx={{
        textAlign: 'left',
        fontSize: { xs: '0.85rem', md: '0.95rem' },
        color: 'black',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}>
        Remember your password?
        <Button
          variant="text"
          component={RouterLink}
          to="/login"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            p: 0,
            minWidth: 0,
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
          }}
          disableRipple
          disableFocusRipple
        >
          Log In
        </Button>
      </Typography>
    </Box>
  );
};

export default ForgotPasswordForm;
