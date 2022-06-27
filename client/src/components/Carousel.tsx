import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material'
import { Box, Button, MobileStepper } from '@mui/material'
import { useState } from 'react'
import SwipeableViews from 'react-swipeable-views'
import { Image } from '../types'

export type CarouselProps = {
  images: Image[];
}

export default function Carousel({
  images,
}: CarouselProps) {
  const maxSteps = images.length;
  const [activeStep, setActiveStep] = useState<number>(0);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  return (
    <Box>
      <SwipeableViews
        index={activeStep}
        onChangeIndex={handleStepChange}
        slideStyle={{ overflow: 'hidden' }}
      >
        {
          images.map(({url, caption}) => (
            <Box>
              <Box
                sx={{
                  background:`linear-gradient(rgba(0, 0, 0, 0.3),rgba(0, 0, 0, 0.3) ),  url(${url}) center no-repeat`,
                  backgroundSize: 'auto,cover',
                  filter: 'blur(5px)',
                  width: '100%',
                  height: 300,
                  position: 'absolute',
                  zIndex: -1
                }}
              />
              <Box
                component='img'
                src={url}
                alt={caption}
                sx={{
                  height: 300,
                  display: 'block',
                  overflow: 'hidden',
                  margin: 'auto',
                  position: 'relative',
                }}
              />
            </Box>
          ))
        }
      </SwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position='static'
        activeStep={activeStep}
        backButton={
          <Button
            size='small'
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
          </Button>
        }
        nextButton={
          <Button
            size='small'
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            <KeyboardArrowRight />
          </Button>
        }
      />
    </Box>
  )
}