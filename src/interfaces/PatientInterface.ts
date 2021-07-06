export interface DocumentInterface {
  name: string;
  link: string;
  date: Date;
}

export interface FisicExploration {
  title: string;
  data: string;
}

export default interface PatientInterface {
  name: string;
  DNI: string;
  lastname: string;
  userID: string;
  email?: string;
  birth?: Date;
  gender?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  postalCode?: string;
  street?: string;
  province?: string;
  documents: DocumentInterface[];
  fisicExploration: FisicExploration[];
}
