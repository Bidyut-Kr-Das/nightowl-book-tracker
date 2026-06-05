"use server"

import { prisma } from "@/prisma/prisma"
import { currentUser } from "@clerk/nextjs/server"

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