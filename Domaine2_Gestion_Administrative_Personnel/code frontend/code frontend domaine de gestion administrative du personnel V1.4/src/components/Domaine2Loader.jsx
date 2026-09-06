import { useState, useEffect } from 'react';
import { Box, Paper, Typography, LinearProgress, useTheme } from '@mui/material';

// --- Domaine 2 brand palette ---
const VIOLET = '#7e3ff2';
const BLEU = '#2a6a9a';
const NAVY = '#0b2a4a';

// 5 Phases (matches D2Layout sidebar)
const PHASE_COLORS = ['#1B4F72', '#2E86C1', '#27AE60', '#F39C12', '#8E44AD'];

// CSS keyframes — injected once via <style> tag
const KEYFRAMES = `
@keyframes ar-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(126,63,242,0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(126,63,242,0); }
}
@keyframes ar-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-8px); opacity: 1; }
}
@keyframes ar-phase-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.4); opacity: 1; }
}
@keyframes ar-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes ar-bg-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

export default function Domaine2Loader() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [dots, setDots] = useState('.');

  // Cycle "Chargement en cours." → ".." → "..." every 500ms
  useEffect(() => {
    const id = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  const bgGradient = isDark
    ? 'linear-gradient(135deg, #0a0a1a 0%, #141428 50%, #1a1a2e 100%)'
    : 'linear-gradient(135deg, #f5f6fa 0%, #e8edf5 100%)';

  return (
    <>
      <style>{KEYFRAMES}</style>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgGradient,
          position: 'relative',
          overflow: 'hidden',
          // Subtle violet radial overlay for depth
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'radial-gradient(circle at 50% 40%, rgba(126,63,242,0.18) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 40%, rgba(126,63,242,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Paper
          elevation={isDark ? 8 : 4}
          sx={{
            position: 'relative',
            zIndex: 1,
            px: { xs: 4, sm: 6 },
            py: { xs: 5, sm: 6 },
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            minWidth: { xs: 280, sm: 340 },
            maxWidth: 420,
            background: isDark
              ? 'rgba(20, 20, 40, 0.72)'
              : 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isDark
              ? '1px solid rgba(126,63,242,0.25)'
              : '1px solid rgba(255,255,255,0.6)',
            boxShadow: isDark
              ? '0 24px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(126,63,242,0.15)'
              : '0 24px 60px -12px rgba(11,42,74,0.18), 0 0 0 1px rgba(255,255,255,0.7)',
            animation: 'ar-fade-in 0.5s ease-out',
          }}
        >
          {/* --- Animated AR monogram --- */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${BLEU} 100%)`,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.9rem',
              letterSpacing: '0.5px',
              fontFamily: '"Inter", sans-serif',
              animation: 'ar-pulse 2s ease-in-out infinite',
              mb: 1,
              userSelect: 'none',
            }}
          >
            AR
          </Box>

          {/* --- Brand title --- */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: isDark ? '#ffffff' : NAVY,
              letterSpacing: '-0.3px',
              textAlign: 'center',
            }}
          >
            Admina-RH
          </Typography>

          {/* --- Subtitle --- */}
          <Typography
            variant="caption"
            sx={{
              color: isDark ? '#aaa' : '#6b7a8a',
              fontSize: '0.78rem',
              textAlign: 'center',
              letterSpacing: '0.2px',
            }}
          >
            Domaine 2 — Gestion Administrative du Personnel
          </Typography>

          {/* --- Animated bouncing dots --- */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mt: 1.5,
              mb: 0.5,
            }}
          >
            {[0, 0.2, 0.4].map((delay, i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: VIOLET,
                  display: 'inline-block',
                  animation: 'ar-dot-bounce 1.4s ease-in-out infinite',
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </Box>

          {/* --- Loading text with cycling ellipsis --- */}
          <Typography
            variant="caption"
            sx={{
              color: '#9aa8b8',
              fontFamily: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.3px',
              textAlign: 'center',
              minHeight: '1.2em',
            }}
          >
            Chargement en cours{dots}
          </Typography>

          {/* --- Indeterminate linear progress bar --- */}
          <LinearProgress
            sx={{
              mt: 2,
              width: 240,
              height: 4,
              borderRadius: 2,
              bgcolor: isDark ? 'rgba(126,63,242,0.15)' : 'rgba(126,63,242,0.1)',
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${VIOLET} 0%, ${BLEU} 100%)`,
                borderRadius: 2,
              },
            }}
          />

          {/* --- 5 phase color dots --- */}
          <Box
            sx={{
              display: 'flex',
              gap: '8px',
              mt: 2.5,
              alignItems: 'center',
            }}
          >
            {PHASE_COLORS.map((color, i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  display: 'inline-block',
                  animation: 'ar-phase-pulse 1.6s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </Box>

          {/* --- Tiny phase counter label --- */}
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              color: '#9aa8b8',
              fontFamily: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            5 phases · 22 écrans
          </Typography>
        </Paper>
      </Box>
    </>
  );
}
