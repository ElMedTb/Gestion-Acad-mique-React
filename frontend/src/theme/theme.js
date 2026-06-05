import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#166534',
            light: '#2e7d32',
            dark: '#14532d',
            contrastText: '#fff',
          },
          secondary: {
            main: '#334155',
            light: '#64748b',
            dark: '#0f172a',
            contrastText: '#fff',
          },
          success: {
            main: '#166534',
            light: '#2e7d32',
            dark: '#14532d',
          },
          warning: {
            main: '#ed6c02',
            light: '#ff9800',
            dark: '#e65100',
          },
          error: {
            main: '#d32f2f',
            light: '#ef5350',
            dark: '#c62828',
          },
          info: {
            main: '#4b5563',
            light: '#6b7280',
            dark: '#374151',
          },
          background: {
            default: '#f6f7f3',
            paper: '#ffffff',
          },
          text: {
            primary: '#1a2027',
            secondary: '#637381',
          },
          divider: 'rgba(0, 0, 0, 0.08)',
        }
      : {
          primary: {
            main: '#2e7d32',
            light: '#4b8f45',
            dark: '#166534',
            contrastText: '#fff',
          },
          secondary: {
            main: '#94a3b8',
            light: '#cbd5e1',
            dark: '#475569',
            contrastText: '#fff',
          },
          success: {
            main: '#2e7d32',
            light: '#4b8f45',
            dark: '#166534',
          },
          warning: {
            main: '#ffa726',
            light: '#ffb74d',
            dark: '#f57c00',
          },
          error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
          },
          info: {
            main: '#9ca3af',
            light: '#d1d5db',
            dark: '#6b7280',
          },
          background: {
            default: '#0d1117',
            paper: '#161b22',
          },
          text: {
            primary: '#e3e8ef',
            secondary: '#a0aab4',
          },
          divider: 'rgba(255, 255, 255, 0.08)',
        }),
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.3 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
    subtitle1: { fontWeight: 500, fontSize: '1rem', lineHeight: 1.5 },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5 },
    body1: { fontSize: '0.938rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
  },

  shape: {
    borderRadius: 8,
  },

  shadows: [
    'none',
    mode === 'light'
      ? '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 1px 2px rgba(0, 0, 0, 0.04)'
      : '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.2)',
    mode === 'light'
      ? '0px 2px 6px rgba(0, 0, 0, 0.06), 0px 2px 4px rgba(0, 0, 0, 0.04)'
      : '0px 2px 6px rgba(0, 0, 0, 0.3), 0px 2px 4px rgba(0, 0, 0, 0.2)',
    mode === 'light'
      ? '0px 4px 12px rgba(0, 0, 0, 0.06)'
      : '0px 4px 12px rgba(0, 0, 0, 0.3)',
    mode === 'light'
      ? '0px 6px 16px rgba(0, 0, 0, 0.08)'
      : '0px 6px 16px rgba(0, 0, 0, 0.35)',
    mode === 'light'
      ? '0px 8px 24px rgba(0, 0, 0, 0.08)'
      : '0px 8px 24px rgba(0, 0, 0, 0.4)',
    mode === 'light'
      ? '0px 12px 32px rgba(0, 0, 0, 0.1)'
      : '0px 12px 32px rgba(0, 0, 0, 0.45)',
    mode === 'light'
      ? '0px 16px 40px rgba(0, 0, 0, 0.1)'
      : '0px 16px 40px rgba(0, 0, 0, 0.5)',
    ...Array(17).fill('none'), // Fill remaining shadow slots
  ],
});

export const createAppTheme = (mode) => {
  const tokens = getDesignTokens(mode);
  const baseTheme = createTheme(tokens);

  return createTheme(baseTheme, {
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundImage: 'none',
            border: `1px solid ${baseTheme.palette.divider}`,
            transition: 'border-color 0.2s ease',
            '&:hover': {
              borderColor: alpha(baseTheme.palette.primary.main, 0.3),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            fontWeight: 600,
            boxShadow: 'none',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: 'none',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: baseTheme.palette.primary.dark,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'medium',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: baseTheme.palette.primary.main,
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: `2px solid ${baseTheme.palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            boxShadow: mode === 'light'
              ? '6px 0 28px rgba(15, 23, 42, 0.08)'
              : '6px 0 28px rgba(0, 0, 0, 0.35)',
            backgroundColor: mode === 'light' ? '#ffffff' : '#111827',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backdropFilter: 'blur(20px)',
            backgroundColor: mode === 'light'
              ? '#ffffff'
              : '#111827',
            borderBottom: `1px solid ${baseTheme.palette.divider}`,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            backgroundImage: 'none',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            borderRadius: 8,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: mode === 'light'
                ? '#f8f9fa'
                : alpha('#ffffff', 0.04),
              borderRadius: '8px 8px 0 0',
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(even)': {
                backgroundColor: mode === 'light'
                  ? alpha('#f5f7fa', 0.5)
                  : alpha('#ffffff', 0.02),
              },
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? alpha('#166534', 0.05)
                  : alpha('#2e7d32', 0.12),
              },
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${baseTheme.palette.divider}`,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 500,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            padding: '8px 16px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              backgroundColor: alpha(baseTheme.palette.primary.main, mode === 'light' ? 0.1 : 0.2),
              color: baseTheme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(baseTheme.palette.primary.main, mode === 'light' ? 0.15 : 0.25),
              },
              '& .MuiListItemIcon-root': {
                color: baseTheme.palette.primary.main,
              },
            },
          },
        },
      },
    },
  });
};

export default createAppTheme;
