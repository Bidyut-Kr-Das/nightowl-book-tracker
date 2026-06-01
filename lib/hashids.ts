import HashIds from "hashids";
export const hashids = new HashIds(process.env.HASHID_SALT, 8);


