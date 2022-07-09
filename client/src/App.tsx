import { useEffect, useState } from 'react';
import axios from 'axios';
import Carousel, { CarouselProps } from './components/Carousel';
import { Pet } from './types';
import PetProfile, { PetProfileProps } from './containers/PetProfile';
import './App.css';
import { Backdrop, CircularProgress } from '@mui/material';

function App() {
  const petId: string = process.env.REACT_APP_PET_ID!;
  const [pet, setPet] = useState<Pet>();
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get<Pet>(`/api/pet/${petId}`);
      setPet(response.data);
      setDataLoading(false);
    }
    fetchData();
  });

  /** Component Props */
  const carouselProps: CarouselProps | undefined = pet
    ? {
        imageUrls: pet.photos,
      }
    : undefined;
  const petProfileProps: PetProfileProps | undefined = pet
    ? {
        pet,
      }
    : undefined;

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={dataLoading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      {carouselProps && <Carousel {...carouselProps} />}
      {petProfileProps && <PetProfile {...petProfileProps} />}
    </>
  );
}

export default App;
