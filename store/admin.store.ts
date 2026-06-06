import { AvatarImages } from "@/lib/generated/prisma/client";
import {
  getAllAvatarsAction,
  uploadAvatarAction,
} from "@/actions/admin.action";
import { create } from "zustand";

type AdminStoreState = {
  avatars: AvatarImages[];

  loading: boolean;
  error: null | string;
};

type AdminStoreActions = {
  getAllAvatars: () => Promise<void>;
  uploadAvatar: (params: Partial<AvatarImages>) => Promise<void>;
};

const initialState: AdminStoreState = {
  avatars: [],
  loading: true,
  error: null,
};

type AdminStore = AdminStoreState & AdminStoreActions;

export const useAdminStore = create<AdminStore>((set) => ({
  ...initialState,
  getAllAvatars: async () => {
    set({ loading: true, error: null });
    const res = await getAllAvatarsAction();
    set({ loading: false, avatars: res });
  },
  uploadAvatar: async (args) => {
    set({ loading: true, error: null });
    const res = await uploadAvatarAction(args);
    if (!res) {
      set({ loading: false, error: "Failed to upload avatar" });
      return;
    }
    set((state) => ({
      ...state,
      loading: false,
      avatars: [...state.avatars, res],
      error: null,
    }));
  },
}));
