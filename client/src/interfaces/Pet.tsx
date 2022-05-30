import Address from "./Address";

interface Pet {
  name: string;
  breed: string;
  imageUrl: string;
  microchip: boolean;
  birthday: Date;
  description: String;
  veterinarianAddress: Address;
}

export default Pet;