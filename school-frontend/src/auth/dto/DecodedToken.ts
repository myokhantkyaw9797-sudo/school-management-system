export  interface DecodedToken {
  sub: string; // Username
  roles?: string[];
  authorities?: string[];
  exp: number;
}