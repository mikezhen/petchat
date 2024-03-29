import {
  Card,
  CardActionArea,
  CardMedia,
  Stack,
  Typography,
} from '@mui/material';
import { Address } from '../types';
import MapIcon from '../assets/mapicon.png';

export type AddressCardProps = {
  addressDescription: string;
  addressName: string;
  address: Address;
  mapUrl: string; // TODO: Make map URL optional
};

export default function AddressCard({
  addressDescription,
  addressName,
  address,
  mapUrl,
}: AddressCardProps) {
  /** Formats address lines into ordered list */
  const formattedAddress: string[] = [
    `${address.streetNumber} ${address.route}`,
    `${address.locality}, ${address.region} ${address.postalCode}`,
  ];

  return (
    <Card raised sx={{ display: 'flex', borderRadius: 8 }}>
      <CardActionArea href={mapUrl}>
        <Stack direction='row'>
          <CardMedia
            component='img'
            image={MapIcon}
            alt='Map icon'
            sx={{ width: 128, objectPosition: '0 100%' }}
          />
          <Stack m={2} justifyContent='flex-start'>
            <Typography fontSize={12} color='text.secondary' gutterBottom>
              {addressDescription}
            </Typography>
            <Typography variant='subtitle2' fontWeight='bold'>
              {addressName}
            </Typography>
            {formattedAddress.map((addressLine, index) => (
              <Typography key={index} variant='subtitle2'>{addressLine}</Typography>
            ))}
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
