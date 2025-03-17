type LoginUserParams = {
  username: string;
  password: string;
};

type RegisterUserParams = {
  username: string;
  fullname: string;
  password: string;
};

type User = {
  id: number;
  username: string;
  fullname: string;
  email?: string;
  dateOfBirth?: string;
  phone?: string;
  role?: string;
  createdDate?: string;
  telegram?: string;
};
