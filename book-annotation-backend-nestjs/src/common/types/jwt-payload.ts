/** What a login token carries: `sub` is the user id (JWT "subject"). */
export interface JwtPayload {
  sub: number;
  username: string;
}
