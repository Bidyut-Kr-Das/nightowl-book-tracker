"use client";
import { useAdminStore } from "@/store/admin.store";
import AvatarDialog from "../_components/avatar-dialog";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/neo-brutalism/card";

export default function AdminPage() {
  const { avatars } = useAdminStore();

  return (
    <section className="max-w-3xl mx-auto">
      <Card className="w-full">
        <CardHeader className="text-3xl flex justify-between">
          <CardTitle className="font-pixel">Avatars</CardTitle>
          <AvatarDialog />
        </CardHeader>
        <CardContent className="">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 justify-center items-center">
            {avatars.map((a) => (
              <Image
                key={a.id}
                height={40}
                width={40}
                src={a.url}
                alt={a.title ?? ""}
                className="h-18 w-18 rounded-full border-4 border-black"
                title={a.title ?? ""}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
