// This file has been superseded by index.d.ts.
//
// All shared types now live in index.d.ts (a TypeScript declaration file).
// Using a .d.ts file rather than a .ts source file means the TypeScript
// compiler treats it as an external type definition, which avoids the
// rootDir constraint error that occurs when the server's tsconfig sees a
// source file outside its own src/ directory.
//
// Nothing should import from this file — the tsconfig path aliases in both
// server/tsconfig.json and client/tsconfig.json point to index.d.ts.
