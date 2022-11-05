import * as argon2 from 'argon2';

export async function hashData(data: string) {
  return await argon2.hash(data);
}
