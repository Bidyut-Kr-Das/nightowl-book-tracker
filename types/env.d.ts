// Custom environment variable typings for the NightOwl project
// Place additional keys here as needed. Keeps process.env strongly typed.

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    HARDCOVER_API_URL: string;
    HARDCOVER_API_KEY: string;

    IMAGEKIT_PRIVATE_KEY: string;
    IMAGEKIT_PUBLIC_KEY: string;
    IMAGEKIT_URL_ENDPOINT: string;
    IMAGEKIT_ID: string;

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string;
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: string;
    CLERK_WEBHOOK_SIGNING_SECRET: string;

    // Allow other environment variables
    [key: string]: string | undefined;
  }
}
