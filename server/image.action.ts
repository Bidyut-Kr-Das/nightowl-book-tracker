"use server";
import { getUploadAuthParams } from "@imagekit/next/server";
import ImageKit from "@imagekit/nodejs";

const serverSideImagekitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

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

export async function deleteImageFromImagekit(fileId: string) {
  try {
    await serverSideImagekitClient.files.delete(fileId);
  } catch (error: any) {
    throw new Error(error.message || "failed to delete imagekit file");
  }
}
