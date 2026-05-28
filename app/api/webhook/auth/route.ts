import { prisma } from "@/prisma/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const client = await clerkClient();

    if (evt.type === "user.created") {
      const { id, first_name, last_name, email_addresses } = evt.data;
      if (!id || !email_addresses.length) {
        return new NextResponse("Webhook donnt have id", {
          status: 200,
        });
      }
      const createdUser = await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email_addresses[0].email_address,
          name: first_name + " " + last_name,
        },
      });

      client.users.updateUser(id, {
        externalId: createdUser.id.toString(),
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
