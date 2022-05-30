import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Button
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import './App.css';
import PetCard from './components/PetCard/PetCard';
import Pet from './interfaces/Pet';

function App() {
  let notifications = 17;

  const pet: Pet = {
    name: 'Princeton',
    breed: 'German Shepherd Mix',
    imageUrl: 'https://www.princeton.edu/sites/default/files/styles/scale_1440/public/images/2022/02/KOA_Nassau_2697x1517.jpg?itok=lA8UuoHt',
    microchip: true,
    birthday: new Date(2021, 7, 5),
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
    <Box sx={{ flexGrow: 1 }}>
    <AppBar position='static'>
      <Toolbar>
        <IconButton
          size='large'
          edge='start'
          color='inherit'
          aria-label='menu'
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <IconButton
            size='large'
            color='inherit'
            aria-label={`show ${notifications} new notifications`}
          >
            <Badge badgeContent={notifications} color='error'>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
    </Box>
    <Box sx={{ minWidth: 275, margin: '8px' }}>
      <PetCard {...pet} />
    </Box>
    <Button variant='contained' startIcon={ <NotificationsIcon /> }>
      Message Me
    </Button>
    </>
  );
}

export default App;
