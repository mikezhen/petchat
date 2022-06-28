import { useEffect, useState } from 'react';
import Carousel, { CarouselProps } from './components/Carousel';
import { Pet } from './types';
import PetProfile, { PetProfileProps } from './containers/PetProfile';
import PetResponse from './api/response/pet';
import './App.css';

function App() {
  const [pet, setPet] = useState<Pet>();

  useEffect(() => {
    async function fetchData() {
      const response = await PetResponse();
      setPet(response);
    }
    fetchData();
  });

  /** Component Props */
  const carouselProps: CarouselProps | undefined = pet
    ? {
        images: pet.photos,
      }
    : undefined;
  const petProfileProps: PetProfileProps | undefined = pet
    ? {
        pet,
      }
    : undefined;

  return (
    <>
      {carouselProps && <Carousel {...carouselProps} />}
      {petProfileProps && <PetProfile {...petProfileProps} />}
    </>
  );
}

export default App;
