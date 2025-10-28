// src/global.d.ts  (optional; CRA-safe)
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_SUPABASE_URL?: string;
      REACT_APP_SUPABASE_ANON_KEY?: string;
      NODE_ENV: 'development' | 'production' | 'test';
      // add any other REACT_APP_* you use
    }
  }
}
