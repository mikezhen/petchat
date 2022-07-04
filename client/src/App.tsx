import { useEffect, useState } from 'react';
import axios from 'axios';
import Carousel, { CarouselProps } from './components/Carousel';
import { Pet } from './types';
import PetProfile, { PetProfileProps } from './containers/PetProfile';
import './App.css';

function App() {
  const petId: string = process.env.REACT_APP_PET_ID!;
  const [pet, setPet] = useState<Pet>();

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get<Pet>(`/api/pet/${petId}`);
      setPet(response.data);
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
      {carouselProps && <Carousel {...carouselProps} />}
      {petProfileProps && <PetProfile {...petProfileProps} />}
    </>
  );
}

export default App;
