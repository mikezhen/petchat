import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  MobileStepper,
  Stack,
  Typography
} from '@mui/material';
import { 
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import './App.css';
import SwipeableViews from 'react-swipeable-views';
import Pet, { Sex } from './interfaces/Pet';
import React, { FC, ReactElement, useState } from 'react';

function App() {
  const genderIcons: Record<Sex, ReactElement> = {
    'Female': <FemaleIcon color="error" sx={{ fontSize: 45 }} />,
    'Male': <MaleIcon color="primary" sx={{ fontSize: 45 }} />,
  };

  const pet: Pet = {
    name: 'Princeton',
    breed: 'German Shepherd Mix',
    sex: 'Male',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_3530.jpg?alt=media&token=4b6f49e7-4189-4c8d-832b-bdd87a7621ad',
    birthday: new Date('2021-07-05T00:00:00'),
    description: 'Super friendly goofball who will say hello to everyone with his lick attack. Loves food and treats, but has sensitive stomach so he should not overeat!',
    veterinarianAddress: {
      name: 'Northwest Neighborhood Veterinary Hospital',
      streetNumber: 2680,
      route: 'NW Thurman St',
      locality: 'Portland', // City
      region: 'OR', // State or province
      postalCode: '97210'
    }
  }

  const images = [
    {
      label: 'Happy Princeton on balcony',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_3530.jpg?alt=media&token=4b6f49e7-4189-4c8d-832b-bdd87a7621ad'
    },
    {
      label: 'Silly Princeton on couch',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_1129.jpg?alt=media&token=846388d9-bfff-44cf-bc52-3b611c1875fe'
    },
    {
      label: 'Princeton laying on the couch',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_2908.jpg?alt=media&token=f4a3b0f8-94f8-4736-a4dc-6468693ef0b0'
    }
  ];

  const demographics = [
    {
      label: 'Age',
      value: '11 mos'
    },
    {
      label: 'Color',
      value: 'Black/Tan'
    },
    {
      label: 'Weight',
      value: '63 lbs'
    }
  ];

  const avatarUrl = 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2Fowner-avatar.jpg?alt=media&token=4f4a90ba-fa80-4a9a-bb74-6f0858884811';
  const description = 'Princeton is a super friendly goofball who will approach and say hello to everyone with his lick attack. He loves food and treats, but has a sensitive stomach so definitely should not overeat!';

  const staticMapUrl = 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2Fstaticmap.png?alt=media&token=9654cacb-e54c-441c-bc6e-fa9bab84bd2c';
  const vetAddress = pet.veterinarianAddress;
  const addressLine1 = `${vetAddress.streetNumber} ${vetAddress.route}`;
  const addressLine2 = `${vetAddress.locality}, ${vetAddress.region} ${vetAddress.postalCode}`;

  const maxSteps: number = images.length;

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  }

  return (
    <>
    <SwipeableViews
        index={activeStep}
        onChangeIndex={handleStepChange}
        slideStyle={{ overflow: 'hidden' }}
      >
        {
          images.map(({label, imageUrl}) => (
            <>
            <Box
              sx={{
                background:`linear-gradient(rgba(0, 0, 0, 0.3),rgba(0, 0, 0, 0.3) ),  url(${imageUrl}) center no-repeat`,
                backgroundSize: 'auto,cover',
                filter: 'blur(5px)',
                width: '100%',
                height: 300,
                position: 'absolute',
                zIndex: -1
              }}
            />
            <Box
              component="img"
              sx={{
                height: 300,
                display: 'block',
                overflow: 'hidden',
                margin: 'auto',
                position: 'relative',
              }}
              alt={label}
              src={imageUrl}
            />
            </>
          ))
        }
      </SwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        backButton={
          <Button
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
          </Button>
        }
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            <KeyboardArrowRight />
          </Button>
        }
      />
    <Container maxWidth="xs">
      <Box sx={{ marginLeft: '10px', marginRight: '10px' }}>
        <Grid container spacing={2} justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              { pet.name }
            </Typography>
            <Typography variant="subtitle1">
              { pet.breed}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            { genderIcons[pet.sex] }
          </Grid>
        </Grid>
      </Box>
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

      <Stack direction="row" spacing={3} mt={4} mb={4} alignItems="center">
        <Avatar alt="Owner" src={ avatarUrl } sx={{ width: 64, height: 64 }} />
        <Typography variant="caption" color="text.secondary" paragraph>{ description }</Typography>
      </Stack>
      
      <Box mb={4}>
      <Card raised sx={{ display: 'flex', borderRadius: 8 }}>
        <CardActionArea href="https://maps.apple.com/?daddr=2680+NW+Thurman+St,Portland,OR">
          <Stack direction="row">
            <CardMedia
              component="img"
              sx={{ width: 128, objectPosition: '0 100%' }}
              src={staticMapUrl}
              alt="Google map"
            />
            <Stack ml={2} mt={2} mb={2} justifyContent="flex-start">
              <Typography sx={{ fontSize: 12 }} color="text.secondary" gutterBottom>Veterinarian</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{ vetAddress.name }</Typography>
              <Typography variant="subtitle2">{ addressLine1 }</Typography>
              <Typography variant="subtitle2">{ addressLine2 }</Typography>
            </Stack>
          </Stack>
        </CardActionArea>
      </Card>
      </Box>

      {/* <Box mt={4} sx={{ textAlign: 'center' }}>
        <Button variant='contained' startIcon={ <NotificationsIcon /> }>
          Message Me
        </Button>
      </Box> */}
      </Container>
      </>
  );
}

export default App;
