export interface ConfimationEmail {
  email: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  authToken: string;
}
