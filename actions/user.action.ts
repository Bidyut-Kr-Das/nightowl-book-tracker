"use server"

import { prisma } from "@/prisma/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

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