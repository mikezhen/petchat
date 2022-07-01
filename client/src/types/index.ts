export interface Address {
  streetNumber: number;
  route: string; // Named route such as NE Sesame St
  locality: string; // City or town
  region: string; // State or province
  postalCode: string;
}

export interface Place {
  name: string; // Name of the place
  address: Address;
  phoneNumber?: string;
}

export interface Owner {
  id: string;
  avatarUrl: string; // URL to the avatar image
  phoneNumbers: string[];
  emails: string[];
}

/** Temp location to capture API responses */
export interface OwnerResponse {
  primaryPhone: string;
}

export interface Weight {
  value: number;
  unit: MassUnit;
}

export interface Image {
  caption: string;
  url: string;
}

export interface Pet {
  name: string;
  breed: string;
  gender: Gender;
  birthday: Date;
  color: string;
  weight: Weight;
  description: string;
  photos: Image[];
  owner: Owner;
  veterinarian: Place;
}

export type MassUnit = 'lb' | 'kg';
export type Gender = 'Male' | 'Female';
