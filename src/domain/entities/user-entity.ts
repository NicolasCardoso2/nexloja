import { UserRole } from "@/domain/enums/user-role";

export type UserEntity = {
  id: number;
  login: string;
  nome: string;
  perfil: UserRole;
  ativo: boolean;
};
