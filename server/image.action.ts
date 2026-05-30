"use server";
import { getUploadAuthParams } from "@imagekit/next/server";
export async function getImageKitAuth() {
  try {
    const { expire, signature, token } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
    return {
      expire,
      signature,
      token,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    };
  } catch (error) {
    console.error(error);
  }
}
