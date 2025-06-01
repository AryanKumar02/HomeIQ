import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../services/auth';
import { useFormGsapAnimation } from '../../animation/useFormGsapAnimation';

interface VerifyEmailFormProps {
  token: string | undefined;
}

const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  // GSAP refs
  const formRef = useRef<any>(null);
  const alertRef = useRef<any>(null);
  const actionBoxRef = useRef<any>(null);

  useFormGsapAnimation({
    formRef,
    fieldRefs: [],
    buttonRef: alertRef,
    extraRefs: [actionBoxRef],
  });

  useEffect(() => {
    const handleVerifyEmail = async () => {
      if (!token) {
        setMessage({
          type: 'error',
          text: 'Invalid verification link. No token provided.',
        });
        setLoading(false);
        return;
      }
      if (hasVerified.current) return;
      hasVerified.current = true;
      try {
        await verifyEmail(token);
        setMessage({
          type: 'success',
          text: 'Email verified successfully! You can now log in to your account.',
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        if (
          error.response?.status === 400 &&
          (error.response?.data?.message?.includes('already') ||
            error.response?.data?.message?.includes('used') ||
            error.response?.data?.message?.includes('invalid'))
        ) {
          setMessage({
            type: 'success',
            text: 'Email verified successfully! You can now log in to your account.',
          });
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setMessage({
            type: 'error',
            text:
              error.response?.data?.message ||
              'Invalid or expired verification link. Please request a new one.',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    handleVerifyEmail();
  }, [token, navigate]);

  return (
    <Box ref={formRef} sx={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: 'black',
          fontSize: { xs: '1.7rem', md: '2rem' },
          fontWeight: 700,
        }}
      >
        Email Verification
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography sx={{ color: 'black', opacity: 0.6 }}>
            Verifying your email address...
          </Typography>
        </Box>
      ) : (
        <>
          {message && (
            <Alert
              ref={alertRef}
              severity={message.type}
              sx={{
                mb: 3,
                textAlign: 'left',
                '& .MuiAlert-message': {
                  fontSize: { xs: '0.95rem', md: '1rem' },
                },
              }}
            >
              {message.text}
            </Alert>
          )}
          <Box ref={actionBoxRef}>
            {message?.type === 'success' ? (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: 'black', opacity: 0.6, mb: 2 }}>
                  🎉 Welcome to EstateLink! You'll be redirected to login in a few seconds.
                </Typography>
                <Typography
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Click here to login now →
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: 'black', opacity: 0.6, mb: 2 }}>
                  Need help? Try these options:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography
                    component={RouterLink}
                    to="/resend-verification"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Request a new verification email
                  </Typography>
                  <Typography
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Back to login
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default VerifyEmailForm;
