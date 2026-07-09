export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  areas?: string[];
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  areas?: string[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
