"use server"

import { prisma } from "@/prisma/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { hashids } from "@/lib/hashids"

export async function getUserProfileAction() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUser.id,
      },
      include: {
        Avatar: true,
      },
    })

    return user
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function updateUserDetailsAction({
  name,
  avatarId,
}: {
  name?: string
  avatarId?: number | null
}) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error("User not authenticated")
    }

    const updatedUser = await prisma.user.update({
      where: {
        clerkUserId: user.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(avatarId !== undefined && { avatarId }),
      },
      include: {
        Avatar: true,
      },
    })

    revalidatePath("/profile")
    return updatedUser
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getUserPublicProfileAction(sharedBy: string) {
  try {
    const ids = hashids.decode(sharedBy);
    if (!ids.length) {
      throw new Error("Invalid sharedBy token");
    }
    const userId = ids[0] as unknown as number;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Avatar: true },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return {
      id: user.id,
      name: user.name,
      avatarId: user.avatarId,
      Avatar: user.Avatar,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getFollowers(){
    try {
        const user = await currentUser()
        if(!user){
            throw new Error("User not authenticated")
        }

        const followersWithBooks = await prisma.user.findUnique({
            where:{
                id: Number(user.externalId)
            }
        })

    } catch (error) {
        console.error(error)    
    }
}