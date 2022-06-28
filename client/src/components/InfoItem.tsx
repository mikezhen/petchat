import { Card, CardContent, Typography } from '@mui/material';

export type InfoItemProps = {
  label: string;
  value: string;
};

export default function InfoItem({ label, value }: InfoItemProps) {
  // TODO: Remove 24px paddingBottom for last-child in CardContent
  return (
    <Card
      variant='outlined'
      sx={{ textAlign: 'center', flex: 1, borderRadius: 6 }}
    >
      <CardContent>
        <Typography fontSize={12} color='text.secondary' gutterBottom>
          {label}
        </Typography>
        <Typography variant='subtitle2' fontWeight='bold'>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
