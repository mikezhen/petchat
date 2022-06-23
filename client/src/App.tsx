import {
  Box,
  Button,
  Container,
  Grid,
  MobileStepper,
  Typography
} from '@mui/material';
import { 
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Male as MaleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import './App.css';
import SwipeableViews from 'react-swipeable-views';
import PetCard from './components/PetCard/PetCard';
import Pet from './interfaces/Pet';
import { useState } from 'react';

function App() {
  const pet: Pet = {
    name: 'Princeton',
    breed: 'German Shepherd Mix',
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
    <Container maxWidth="xs">
      <SwipeableViews
        index={activeStep}
        onChangeIndex={handleStepChange}
        slideStyle={{ overflow: 'hidden' }}
      >
        {
          images.map(({label, imageUrl}) => (
            <Box
              component="img"
              sx={{
                height: 300,
                display: 'block',
                overflow: 'hidden',
                margin: 'auto',
              }}
              alt={label}
              src={imageUrl}
            />
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
            <MaleIcon
              color="primary"
              sx={{ fontSize: 45 }}
            />
          </Grid>
        </Grid>
      </Box>
      {/* <PetCard {...pet} /> */}
      {/* <Box sx={{ textAlign: 'center', marginY: '8px' }}>
        <Button variant='contained' startIcon={ <NotificationsIcon /> }>
          Message Me
        </Button>
      </Box> */}
      </Container>
  );
}

export default App;
