/** The user Passport attaches to `request.user` after authentication. */
export interface AuthenticatedUser {
  id: number;
  username: string;
}
