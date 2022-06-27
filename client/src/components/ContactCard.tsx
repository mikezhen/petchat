import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { Avatar, AvatarProps, Box, Button, ButtonProps, Stack, Typography } from '@mui/material'
import { Image } from '../types'

export type ContactCardProps = {
  avatar: Image,
  description: string;
  handleButtonClick: () => void;
  avatarProps?: AvatarProps;
  buttonProps?: ButtonProps;
}

export default function ContactCard({
  avatar,
  description,
  handleButtonClick,
  avatarProps,
  buttonProps,
}: ContactCardProps) {
  // Default dimensions for avatar
  type Dimension = { width: number, height: number };
  const avatarDimension: Dimension = {
    width: 64,
    height: 64,
  };

  return (
    <Box>
      <Stack direction='row' spacing={3} alignItems='center'>
        <Avatar
          src={avatar.url}
          alt={avatar.caption}
          {...avatarProps} // Props first to prevent overriding sx attribute
          sx={{...avatarDimension, ...avatarProps?.sx}}
        />
        <Typography variant='caption' color='text.secondary' paragraph>
          { description }
        </Typography>
      </Stack>
      <Box mt={2} textAlign='center'>
        <Button
          variant='contained'
          color='info'
          startIcon={ <NotificationsIcon /> }
          onClick={handleButtonClick}
        >
          { buttonProps?.children ?? 'Contact Owner' }
        </Button>
      </Box>
    </Box>
  )
}