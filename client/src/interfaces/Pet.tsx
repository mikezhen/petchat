import Address from "./Address";

interface Pet {
  name: string;
  breed: string;
  imageUrl: string;
  birthday: Date;
  description: String;
  veterinarianAddress: Address;
}

export default Pet;