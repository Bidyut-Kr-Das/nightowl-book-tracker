"use client";
import CoverImageUpload from "@/components/book-form-dialog/cover-image-upload";
import { Button } from "@/components/neo-brutalism/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/neo-brutalism/dialog";
import { Input } from "@/components/neo-brutalism/input";
import { Label } from "@/components/neo-brutalism/label";
import { getImageKitAuth } from "@/server/image.action";
import { useAdminStore } from "@/store/admin.store";
import { upload } from "@imagekit/next";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type AvatarImageUploadType = {
  url: string | null;
  fileId: string | null;
  avatar: File | null;
  title?: string;
};

export default function AvatarDialog() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AvatarImageUploadType>({
    url: null,
    avatar: null,
    fileId: null,
  });

  const { uploadAvatar, loading, error } = useAdminStore();

  const updateField = useCallback(
    <K extends keyof AvatarImageUploadType>(
      key: K,
      value: AvatarImageUploadType[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: any) => {
      if (!formData.url) {
        toast.error("Avatar image is required");
        return;
      }
      e.preventDefault();
      setSubmitting(true);
      try {
        if (formData.avatar) {
          const res = await getImageKitAuth();
          if (!res) {
            toast.error("Authentication Failed for imagekit");
            return;
          }
          const { expire, publicKey, signature, token } = res;
          const { fileId, url } = await upload({
            file: formData.avatar,
            expire,
            fileName: formData.title + "-cover",
            publicKey,
            signature,
            token,
          });
          if (url && fileId) {
            formData.url = url;
            formData.fileId = fileId;
            formData.avatar = null;
          }
        }

        await uploadAvatar({
          title: formData.title,
          url: formData.url!,
          fileId: formData.fileId!,
        });
        // onSubmit(formData);
      } finally {
        setSubmitting(false);
      }
    },
    [formData],
  );
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>Add New Avatar</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Add New Avatar</DialogTitle>
            <DialogDescription>
              Create a new avatar. It will be accessible to all the users
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex w-full justify-center">
              <CoverImageUpload
                imageUrl={formData.url}
                onImageChange={(file, previewUrl) => {
                  updateField("avatar", file);
                  updateField("url", previewUrl);
                }}
                className="h-32 w-32 aspect-square rounded-full"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name-1">Title</Label>
              <Input
                id="name-1"
                name="name"
                defaultValue=""
                onChange={(e) => {
                  updateField("title", e.target.value);
                }}
              />
            </div>
            {/* <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div> */}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="neutral">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
