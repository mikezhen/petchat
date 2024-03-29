import { Notifications as NotificationsIcon } from '@mui/icons-material';
import {
  Avatar,
  AvatarProps,
  Box,
  ButtonProps,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

export type ContactCardProps = {
  avatarUrl: string;
  description: string;
  handleButtonClick: () => void;
  buttonLoading: boolean;
  avatarProps?: AvatarProps;
  buttonProps?: ButtonProps;
};

export default function ContactCard({
  avatarUrl,
  description,
  handleButtonClick,
  buttonLoading,
  avatarProps,
  buttonProps,
}: ContactCardProps) {
  // Default dimensions for avatar
  type Dimension = { width: number; height: number };
  const avatarDimension: Dimension = {
    width: 64,
    height: 64,
  };

  return (
    <Box>
      <Stack direction='row' spacing={3} alignItems='center'>
        <Avatar
          src={avatarUrl}
          alt='Owner avatar'
          {...avatarProps} // Props first to prevent overriding sx attribute
          sx={{ ...avatarDimension, ...avatarProps?.sx }}
        />
        <Typography variant='caption' color='text.secondary' paragraph>
          {description}
        </Typography>
      </Stack>
      <Box mt={2} textAlign='center'>
        <LoadingButton
          variant='contained'
          color='info'
          loading={buttonLoading}
          loadingPosition='start'
          startIcon={<NotificationsIcon />}
          onClick={handleButtonClick}
          {...buttonProps}
        >
          {buttonProps?.children ?? 'Contact Owner'}
        </LoadingButton>
      </Box>
    </Box>
  );
}
