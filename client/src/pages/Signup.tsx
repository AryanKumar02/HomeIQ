import Box from '@mui/material/Box';
import SignupForm from '../components/forms/SignupForm';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const Signup = () => {
  const theme = useTheme();
  /**
   * Show the hero image only on large (lg ≥ 1200 px) screens.
   * On smaller viewports we collapse to a single, centred form.
   */
  const showImage = useMediaQuery(theme.breakpoints.up('lg'));
  return (
    showImage ? (
      /* ─────────── Large screens: two‑column layout ─────────── */
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'row',
          backgroundColor: 'background.default',
        }}
      >
        {/* Left: hero image */}
        <Box
          sx={{
            flex: 1.4,
            minWidth: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src="/assets/splashes/signinsplash2.png"
            alt="Signup splash"
            sx={{
              width: '100%',
              height: '100vh',
              objectPosition: '49%',
              objectFit: 'cover',
              borderRadius: '0 16px 16px 0',
            }}
          />
        </Box>

        {/* Right: form */}
        <Box
          sx={{
            flex: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 675,
            width: '100%',
            px: 2,
          }}
        >
          <Box sx={{ maxWidth: 380, width: '100%' }}>
            <SignupForm />
          </Box>
        </Box>
      </Box>
    ) : (
      /* ─────────── Small screens: centred form only ─────────── */
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto' }}>
          <SignupForm />
        </Box>
      </Box>
    )
  );
};

export default Signup;
