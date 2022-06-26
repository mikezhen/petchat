import { Box, Grid, Typography } from '@mui/material';
import { ReactElement } from 'react';

type HeaderProps = {
  title: string;
  subtitle: string;
  icon: ReactElement
};

export default function Header({
  title,
  subtitle,
  icon
}: HeaderProps) {
  return (
    <Box ml={2} mr={2}>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            { title }
          </Typography>
          <Typography variant="subtitle1">
            { subtitle }
          </Typography>
        </Grid>
        <Grid item xs={2}>
          { icon }
        </Grid>
      </Grid>
    </Box>
  )
}