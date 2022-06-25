import Address from "./Address";

export type Sex = 'Male' | 'Female';

interface Pet {
  name: string;
  breed: string;
  sex: Sex;
  imageUrl: string;
  birthday: Date;
  description: String;
  veterinarianAddress: Address;
}

export default Pet;