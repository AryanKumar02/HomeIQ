import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Button, Alert, Checkbox, FormControlLabel, FormControl } from "@mui/material";
import gsap from 'gsap';
import { signup } from '../../services/auth';
import { Link as RouterLink} from 'react-router-dom';
import { useFormGsapAnimation } from '../animation/useFormGsapAnimation';

const SignupForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstNameRef = useRef(null);
  const secondNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const checkboxRef = useRef(null);
  const loginRef = useRef(null);

  useFormGsapAnimation({
    formRef,
    fieldRefs: [firstNameRef, secondNameRef, emailRef, passwordRef],
    buttonRef,
    extraRefs: [checkboxRef, loginRef],
  });

  // Shake animation on error
  useEffect(() => {
    if (error && formRef.current) {
      const tl = gsap.timeline();
      tl.to(formRef.current, { x: -14, duration: 0.07, ease: 'power1.inOut' })
        .to(formRef.current, { x: 12, duration: 0.07, ease: 'power1.inOut' })
        .to(formRef.current, { x: -8, duration: 0.06, ease: 'power1.inOut' })
        .to(formRef.current, { x: 6, duration: 0.06, ease: 'power1.inOut' })
        .to(formRef.current, { x: -3, duration: 0.05, ease: 'power1.inOut' })
        .to(formRef.current, { x: 0, duration: 0.05, ease: 'power1.inOut' });
    }
  }, [error]);

  // Map backend error messages to user-friendly messages
  function getFriendlyErrorMessage(err: any): string {
    if (err?.response?.status === 409 && err?.response?.data?.message?.includes('already registered')) {
      return 'An account with this email already exists.';
    }
    if (err?.response?.status === 400 && err?.response?.data?.message?.includes('Password must')) {
      return 'Password must be at least 8 characters and contain at least one letter and one number.';
    }
    if (err?.response?.status === 500) {
      return 'Something went wrong. Please try again later.';
    }
    return 'Unable to sign up. Please check your details and try again.';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (buttonRef.current) {
      gsap.to(buttonRef.current, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    }
    try {
      await signup(firstName, secondName, email, password);
      // Optionally redirect or show success
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      ref={formRef}
      sx={{
        width: { xs: 300, sm: 320, md: 340 },
        maxWidth: "100%",
        position: 'relative',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: "black",
          textAlign: "center",
          fontSize: { xs: "1.7rem", md: "2rem" },
          fontWeight: 700,
        }}
      >
        Sign Up for EstateLink
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: { xs: 1.5, md: 2 },
          color: "black",
          opacity: 0.4,
          textAlign: "center",
          fontSize: { xs: "0.92rem", md: "1.05rem" },
        }}
      >
        Create your real estate management account
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.1 }}>
          <Box ref={firstNameRef} sx={{ flex: 1 }}>
            <Typography
              htmlFor="firstName"
              component="label"
              sx={{
                mb: 0.7,
                display: "block",
                fontSize: { xs: "0.89rem", md: "1.01rem" },
                fontWeight: 600,
                color: "black",
              }}
            >
              First Name
            </Typography>
            <TextField
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              aria-label="First name"
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
                  height: { xs: 38, md: 40 },
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  background: 'transparent',
                  color: '#222',
                  fontWeight: 500,
                  letterSpacing: 0.01,
                },
              }}
            />
          </Box>
          <Box ref={secondNameRef} sx={{ flex: 1 }}>
            <Typography
              htmlFor="secondName"
              component="label"
              sx={{
                mb: 0.7,
                display: "block",
                fontSize: { xs: "0.89rem", md: "1.01rem" },
                fontWeight: 600,
                color: "black",
              }}
            >
              Second Name
            </Typography>
            <TextField
              id="secondName"
              type="text"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              fullWidth
              required
              aria-label="Second name"
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
                  height: { xs: 38, md: 40 },
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  background: 'transparent',
                  color: '#222',
                  fontWeight: 500,
                  letterSpacing: 0.01,
                },
              }}
            />
          </Box>
        </Box>
        <Box ref={emailRef} sx={{ mb: 1.5 }}>
          <Typography
            htmlFor="email"
            component="label"
            sx={{
              mb: 0.7,
              display: "block",
              fontSize: { xs: "0.89rem", md: "1.01rem" },
              fontWeight: 600,
              color: "black",
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
            aria-label="Email address"
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
                height: { xs: 38, md: 40 },
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                background: 'transparent',
                color: '#222',
                fontWeight: 500,
                letterSpacing: 0.01,
              },
            }}
          />
        </Box>
        <Box ref={passwordRef} sx={{ mb: 1.5 }}>
          <Typography
            htmlFor="password"
            component="label"
            sx={{
              mb: 0.7,
              display: "block",
              fontSize: { xs: "0.89rem", md: "1.01rem" },
              fontWeight: 600,
              color: "black",
            }}
          >
            Password
          </Typography>
          <TextField
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            aria-label="Password"
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
                height: { xs: 38, md: 40 },
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                background: 'transparent',
                color: '#222',
                fontWeight: 500,
                letterSpacing: 0.01,
              },
            }}
          />
        </Box>
        <FormControl ref={checkboxRef} sx={{ mb: 2, alignItems: 'flex-start', width: '100%', pl: 0 }} component="fieldset" variant="standard">
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                color="primary"
                sx={{ p: 0, pr: 1.2 }}
              />
            }
            label={
              <Box component="span" sx={{ fontWeight: 700, color: 'black', fontSize: '0.97rem', display: 'inline' }}>
                I <Box component="span" sx={{ color: '#036CA3', fontWeight: 700, display: 'inline' }}>agree</Box> to the{' '}
                <Box
                  component={RouterLink}
                  to="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#036CA3',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Terms of Service
                </Box>
                {' '}and{' '}
                <Box
                  component={RouterLink}
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#036CA3',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Privacy Policy
                </Box>
              </Box>
            }
            sx={{ alignItems: 'center', m: 0, pl: 0 }}
          />
        </FormControl>

        <Typography ref={loginRef} sx={{
          mb: 3,
          fontSize: { xs: "0.85rem", md: "0.95rem" },
          color: "black",
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          justifyContent: 'flex-start',
          fontWeight: 600,
        }}>
          Have an account already?
          <Button
            variant="text"
            component={RouterLink}
            to="/login"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              p: 0,
              minWidth: 0,
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
            disableRipple
            disableFocusRipple
          >
            Log in
          </Button>
        </Typography>

        <Button
          ref={buttonRef}
          type="submit"
          variant="contained"
          fullWidth
          aria-label="Sign up for your account"
          sx={{
            mt: 0,
            mb: 2,
            fontSize: { xs: "1rem", md: "1.1rem" },
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
          disabled={loading || !acceptTerms}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </Box>
    </Box>
  );
};

export default SignupForm;
