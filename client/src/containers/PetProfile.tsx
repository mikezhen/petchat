import { Female as FemaleIcon, Male as MaleIcon } from '@mui/icons-material';
import { Box, Container, Stack } from '@mui/material';
import axios from 'axios';
import { formatDistanceToNowStrict } from 'date-fns';
import { parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { ReactElement, useState } from 'react';
import AddressCard, { AddressCardProps } from '../components/AddressCard';
import ContactCard, { ContactCardProps } from '../components/ContactCard';
import Header, { HeaderProps } from '../components/Header';
import InfoItem from '../components/InfoItem';
import { Gender, OwnerPhoneResponse, Pet } from '../types';

export type PetProfileProps = {
  pet: Pet;
};

export default function PetProfile({ pet }: PetProfileProps) {
  const GenderIcon = (gender: Gender, size?: number): ReactElement => {
    const fontSize = size ?? 45; // Default size if none specified
    return {
      Female: <FemaleIcon color='error' sx={{ fontSize }} />,
      Male: <MaleIcon color='primary' sx={{ fontSize }} />,
    }[gender];
  };

  const [contactOwnerLoading, setContactOwnerLoading] = useState<boolean>(false);
  const openContactOwner = () => {
    setContactOwnerLoading(true);
    axios
      .get<OwnerPhoneResponse>(`/api/owner/${pet.owner.id}/phone`)
      .then((response) => {
        const phoneNumber: PhoneNumber = parsePhoneNumber(
          response.data.primaryPhone,
          'US'
        );
        setContactOwnerLoading(false);
        window.open(phoneNumber.getURI(), '_self');
      })
      .catch((error) => console.error(error)) // Temporary handling error in console log
  };

  const currentAge: string = formatDistanceToNowStrict(pet.birthday, {
    roundingMethod: 'floor',
  });
  const demographics = [
    { label: 'Age', value: currentAge },
    { label: 'Color', value: pet.color },
    { label: 'Weight', value: `${pet.weight.value} ${pet.weight.unit}` },
  ];

  const headerProps: HeaderProps = {
    title: pet.name,
    subtitle: pet.breed,
    icon: GenderIcon(pet.gender),
  };

  const contactCardProps: ContactCardProps = {
    avatarUrl: pet.owner.avatarUrl,
    description: pet.description,
    handleButtonClick: openContactOwner,
    buttonLoading: contactOwnerLoading,
  };

  const addressCardProps: AddressCardProps = {
    addressDescription: 'Veterinarian',
    addressName: pet.veterinarian.name,
    address: pet.veterinarian.address,
    mapUrl: `https://maps.apple.com/?q=${encodeURI(pet.veterinarian.name)}`,
  };

  return (
    <Container maxWidth='xs'>
      <Box ml={2} mr={2}>
        <Header {...headerProps} />
      </Box>
      <Stack direction='row' spacing={2} mt={2} mb={4}>
        {demographics.map((item) => (
          <InfoItem {...item} />
        ))}
      </Stack>
      <ContactCard {...contactCardProps} />
      <Box mt={4} mb={4}>
        <AddressCard {...addressCardProps} />
      </Box>
    </Container>
  );
}
