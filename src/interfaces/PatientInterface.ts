export interface DocumentInterface {
    name: string;
    link: string;
    date: Date;
}

export default interface PatientInterface {
  name: string;
  lastname: string;
  email: string;
  birth: Date;
  DNI: string;
  gender: string;
  age: number;
  phone: string;
  mobile: string;
  adress: string;
  postalCode: string;
  street: string;
  province: string;
  documents: DocumentInterface[]
}

