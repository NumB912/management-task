export interface IAccountAccessRepository {
  findAccountAccess(id: string): Promise<{ blocked: boolean } | null>;
}
