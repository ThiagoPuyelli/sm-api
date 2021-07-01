import PatientInterface from "./PatientInterface";
import TurnInterface from "./TurnInterface";

export default interface UserInterface {
  email: string;
  password: string;
  patients: PatientInterface[];
  schedule: TurnInterface[];
  comparePasswords?: Function;
}