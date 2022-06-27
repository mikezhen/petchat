import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography
} from '@mui/material';
import { 
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import './App.css';
import { ReactElement } from 'react';
import Header, { HeaderProps } from './components/Header';
import Carousel, { CarouselProps } from './components/Carousel';
import { Pet, Sex } from './types';
import ContactCard, { ContactCardProps } from './components/ContactCard';
import AddressCard, { AddressCardProps } from './components/AddressCard';

function App() {
  const genderIcons: Record<Sex, ReactElement> = {
    'Female': <FemaleIcon color="error" sx={{ fontSize: 45 }} />,
    'Male': <MaleIcon color="primary" sx={{ fontSize: 45 }} />,
  };

  const pet: Pet = {
    name: 'Princeton',
    breed: 'German Shepherd Mix',
    sex: 'Male',
    birthday: new Date('2021-07-05T00:00:00'),
    color: 'Black/Tan',
    weight: {value: 63, unit: 'lb'},
    description: 'Super friendly goofball who will say hello to everyone with his lick attack. Loves food and treats, but has sensitive stomach so he should not overeat!',
    photos: [
      {
        caption: 'Happy Princeton on balcony',
        url: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_3530.jpg?alt=media&token=4b6f49e7-4189-4c8d-832b-bdd87a7621ad'
      },
      {
        caption: 'Silly Princeton on couch',
        url: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_1129.jpg?alt=media&token=846388d9-bfff-44cf-bc52-3b611c1875fe'
      },
      {
        caption: 'Princeton laying on the couch',
        url: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_2908.jpg?alt=media&token=f4a3b0f8-94f8-4736-a4dc-6468693ef0b0'
      }
    ],
    owner: {
      avatarUrl: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2Fowner-avatar.jpg?alt=media&token=4f4a90ba-fa80-4a9a-bb74-6f0858884811',
      phoneNumbers: [],
      emails: []
    },
    veterinarian: {
      name: 'Northwest Neighborhood Veterinary Hospital',
      address: {
        streetNumber: 2680,
        route: 'NW Thurman St',
        locality: 'Portland', // City
        region: 'OR', // State or province
        postalCode: '97210'
      }
    }
  }

  const demographics = [
    {
      label: 'Age',
      value: '11 mos'
    },
    {
      label: 'Color',
      value: pet.color
    },
    {
      label: 'Weight',
      value: `${pet.weight.value} ${pet.weight.unit}`
    }
  ];

  const headerProps: HeaderProps = {
    title: pet.name,
    subtitle: pet.breed,
    icon: genderIcons[pet.sex],
  };

  const carouselProps: CarouselProps = {
    images: pet.photos,
  };

  const contactCardProps: ContactCardProps = {
    avatar: {
      caption: 'Owner',
      url: pet.owner.avatarUrl
    },
    description: pet.description,
  };

  const addressCardProps: AddressCardProps = {
    addressType: 'Veterinarian',
    addressName: pet.veterinarian.name,
    address: pet.veterinarian.address,
    mapUrl: `https://maps.apple.com/?q=${encodeURI(pet.veterinarian.name)}`,
  }

  return (
    <>
    <Carousel {...carouselProps} />
    <Container maxWidth="xs">
      <Header {...headerProps} />
      <Stack direction="row" spacing={2} mt={2}>
        {
          demographics.map(({ label, value }) => (
            <Card variant="outlined" sx={{ textAlign: 'center', flex: 1, borderRadius: 6 }}>
              <CardContent sx={{ paddingBottom: '16px' }}>
                <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>
                  { label }
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{ value }</Typography>
              </CardContent>
            </Card>
          ))
        }
      </Stack>

      <ContactCard {...contactCardProps} />
      
      <Box mt={4} mb={4}>
        <AddressCard {...addressCardProps} />
      </Box>
      </Container>
      </>
  );
}

export default App;
