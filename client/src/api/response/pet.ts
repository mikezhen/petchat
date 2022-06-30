import { Pet } from '../../types';

const pet: Pet = {
  name: 'Princeton',
  breed: 'German Shepherd Mix',
  gender: 'Male',
  birthday: new Date('2021-07-05T00:00:00'),
  color: 'Black/Tan',
  weight: { value: 63, unit: 'lb' },
  description:
    'Super friendly goofball who will say hello to everyone with his lick attack. Loves food and treats, but has sensitive stomach so he should not overeat!',
  photos: [
    {
      caption: 'Happy Princeton on balcony',
      url: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_3530.jpg?alt=media&token=4b6f49e7-4189-4c8d-832b-bdd87a7621ad',
    },
    {
      caption: 'Silly Princeton on couch',
      url: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_1129.jpg?alt=media&token=846388d9-bfff-44cf-bc52-3b611c1875fe',
    },
    {
      caption: 'Princeton laying on the couch',
      url: 'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2FIMG_2908.jpg?alt=media&token=f4a3b0f8-94f8-4736-a4dc-6468693ef0b0',
    },
  ],
  owner: {
    id: 'KiEatjsS8ef31OAfhXIV',
    avatarUrl:
      'https://firebasestorage.googleapis.com/v0/b/petchat-85f05.appspot.com/o/asset%2Fowner-avatar.jpg?alt=media&token=4f4a90ba-fa80-4a9a-bb74-6f0858884811',
    phoneNumbers: ['7031234567'],
    emails: [],
  },
  veterinarian: {
    name: 'Northwest Neighborhood Veterinary Hospital',
    address: {
      streetNumber: 2680,
      route: 'NW Thurman St',
      locality: 'Portland', // City
      region: 'OR', // State or province
      postalCode: '97210',
    },
  },
};

const PetResponse = async () => {
  return pet;
}

export default PetResponse;
