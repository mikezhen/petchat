import { Grid, Typography } from '@mui/material';
import { ReactElement } from 'react';

export type HeaderProps = {
  title: string;
  subtitle: string;
  icon: ReactElement
}

export default function Header({
  title,
  subtitle,
  icon,
}: HeaderProps) {
  return (
    <Grid container spacing={2} justifyContent='space-between'>
      <Grid item>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant='subtitle1'>
          {subtitle}
        </Typography>
      </Grid>
      <Grid item xs={2}>
        {icon}
      </Grid>
    </Grid>
  )
}