export interface ConfirmedEmail {
  email: string;
  name: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
}
