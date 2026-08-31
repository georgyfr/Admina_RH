import { useState } from 'react';
import { Box, Chip, TextField, Typography } from '@mui/material';

export default function TagInput({ value = [], onChange, label, placeholder, chipColor = '#1565c0', chipBg = '#e3f2fd' }) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const tag = input.trim().replace(/,$/, '');
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleDelete = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'block',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          alignItems: 'center',
          p: 0.5,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          minHeight: 42,
          bgcolor: '#fff',
          '&:focus-within': { borderColor: 'primary.main', bgcolor: '#fafafa' },
          transition: 'all 0.2s',
        }}
      >
        {value.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            onDelete={() => handleDelete(tag)}
            sx={{
              bgcolor: chipBg,
              color: chipColor,
              fontWeight: 500,
              fontSize: '0.78rem',
              height: 26,
              '& .MuiChip-deleteIcon': { color: chipColor, '&:hover': { color: '#d32f2f' } },
            }}
          />
        ))}
        <TextField
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? (placeholder || 'Ajouter...') : ''}
          variant="standard"
          sx={{
            flex: '1 1 100px',
            minWidth: 100,
            '& input': { fontSize: '0.85rem', p: '4px 0' },
            '& .MuiInput-underline:before, & .MuiInput-underline:after': { display: 'none' },
          }}
        />
      </Box>
    </Box>
  );
}
