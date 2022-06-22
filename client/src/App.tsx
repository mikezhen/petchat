import {
  Box,
  Button
} from '@mui/material';
import { 
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import './App.css';
import PetCard from './components/PetCard/PetCard';
import Pet from './interfaces/Pet';

function App() {
  const pet: Pet = {
    name: 'Princeton',
    breed: 'German Shepherd Mix',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_3530.jpg?alt=media&token=4b6f49e7-4189-4c8d-832b-bdd87a7621ad',
    birthday: new Date('2021-07-05T00:00:00'),
    description: 'Super friendly goofball who will say hello to everyone with his lick attack. Loves food and treats, but has sensitive stomach so he should not overeat!',
    veterinarianAddress: {
      name: 'Northwest Neighborhood Veterinary Hospital',
      streetAddress1: '2680 NW Thurman St', // Address 1
      streetAddress2: '', // Address 2
      addressLocality: 'Portland', // City
      addressRegion: 'OR', // State or province
      postalCode: '97210'
    }
  }

  return (
    <>
    <Box sx={{ minWidth: 275, maxWidth: 375, margin: 'auto', marginY: '8px' }}>
      <PetCard {...pet} />
      <Box sx={{ textAlign: 'center', marginY: '8px' }}>
        <Button variant='contained' startIcon={ <NotificationsIcon /> }>
          Message Me
        </Button>
      </Box>
    </Box>
    </>
  );
}

export default App;
