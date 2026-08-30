import { ResponsiveGridLayout } from 'react-grid-layout';
import { Paper, Typography, Box } from '@mui/material';
export default function TestGrid() {
  const layout = [
    { i: 'a', x: 0, y: 0, w: 6, h: 4 },
    { i: 'b', x: 6, y: 0, w: 6, h: 4 },
  ];
  return (
    <Box p={3}>
      <ResponsiveGridLayout layout={layout} layouts={{ lg: layout }} breakpoints={{ lg: 900, md: 600, sm: 0 }} cols={{ lg: 12, md: 6, sm: 1 }} rowHeight={38} margin={[12, 12]}>
        <div key="a"><Paper sx={{ p: 2, height: '100%' }}><Typography>Widget A</Typography></Paper></div>
        <div key="b"><Paper sx={{ p: 2, height: '100%' }}><Typography>Widget B</Typography></Paper></div>
      </ResponsiveGridLayout>
    </Box>
  );
}
