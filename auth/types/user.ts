export type User = {
  id?: string;
  email: string;
  password: string;
  name?: string;
  isAdmin?: number | 0 | 1;
  active?: number | 0 | 1;
  emp_acesso?: Number[];
  codigo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  id_tenant?: number;
};
