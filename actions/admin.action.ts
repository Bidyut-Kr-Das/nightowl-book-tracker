"use server";

import { AvatarImages } from "@/lib/generated/prisma/client";
import { prisma } from "@/prisma/prisma";

export async function uploadAvatarAction({
  title,
  url,
  metaData,
  tags,
}: Partial<AvatarImages>) {
  try {
    if (!url) {
      throw new Error("url should exist");
    }

    const res = await prisma.avatarImages.create({
      data: {
        title,
        url,
        metaData: metaData ?? undefined,
        tags,
      },
    });



    return res;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllAvatarsAction() {
  try {
    return prisma.avatarImages.findMany();
  } catch (error) {
    console.error(error);
  }
}
