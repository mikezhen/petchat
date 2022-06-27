import Carousel, { CarouselProps } from './components/Carousel';
import { Pet } from './types';
import PetProfile, { PetProfileProps } from './containers/PetProfile';
import PetResponse from './api/response/pet';
import './App.css';

function App() {
  const pet: Pet = PetResponse; // Temp hardcode response

  const carouselProps: CarouselProps = {
    images: pet.photos,
  };

  const petProfileProps: PetProfileProps = {
    pet,
  };

  return (
    <>
      <Carousel {...carouselProps} />
      <PetProfile {...petProfileProps} />
    </>
  );
}

export default App;
