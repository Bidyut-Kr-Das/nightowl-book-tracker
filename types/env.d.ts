// Custom environment variable typings for the NightOwl project
// Place additional keys here as needed. Keeps process.env strongly typed.

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;

    // Allow other environment variables
    [key: string]: string | undefined;
  }
}
