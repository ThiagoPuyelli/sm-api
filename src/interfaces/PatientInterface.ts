export interface DocumentInterface {
    name: string;
    link: string;
    date: Date;
}

export default interface PatientInterface {
  name: string;
  DNI: string;
  lastname: string;
  email?: string;
  birth?: Date;
  gender?: string;
  phone?: string;
  mobile?: string;
  adress?: string;
  postalCode?: string;
  street?: string;
  province?: string;
  documents: DocumentInterface[]
}
