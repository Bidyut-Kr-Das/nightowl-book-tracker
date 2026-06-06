import { AvatarImages } from "@/lib/generated/prisma/client";
import { getUserProfileAction, updateUserDetailsAction } from "@/actions/user.action";
import { getAllAvatarsAction } from "@/actions/admin.action";
import { create } from "zustand";

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  clerkUserId: string;
  avatarId: number | null;
  Avatar: AvatarImages | null;
};

export type UserState = {
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  avatars: AvatarImages[];
  avatarsLoading: boolean;
};

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  avatars: [],
  avatarsLoading: false,
};

type UserActions = {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    avatarId?: number | null;
  }) => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  fetchAvatars: () => Promise<void>;
};

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set) => ({
  ...initialState,

  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const result = await getUserProfileAction();
      if (!result) {
        set({ loading: false, error: "Failed to fetch profile" });
        return;
      }
      set({
        profile: {
          id: result.id,
          name: result.name,
          email: result.email,
          clerkUserId: result.clerkUserId,
          avatarId: result.avatarId,
          Avatar: result.Avatar,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      set({ error: "Failed to fetch profile", loading: false });
    }
  },

  fetchAvatars: async () => {
    set({ avatarsLoading: true, error: null });
    try {
      const result = await getAllAvatarsAction();
      set({ avatarsLoading: false, avatars: result ?? [] });
    } catch (error) {
      console.error("Failed to fetch avatars:", error);
      set({ avatarsLoading: false, error: "Failed to fetch avatars" });
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const result = await updateUserDetailsAction(data);
      if (!result) {
        set({ loading: false, error: "Failed to update profile" });
        return;
      }
      set({
        profile: {
          id: result.id,
          name: result.name,
          email: result.email,
          clerkUserId: result.clerkUserId,
          avatarId: result.avatarId,
          Avatar: result.Avatar,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      set({ error: "Failed to update profile", loading: false });
    }
  },
}));