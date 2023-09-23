export interface JwtPayload {
  userId: number;
  username: string;
}

export interface JwtPayloadWithRefreshToken extends JwtPayload {
  refreshToken: string;
}
export type createTokensReturn = {
  accessToken: string;
  refreshToken: string;
};
