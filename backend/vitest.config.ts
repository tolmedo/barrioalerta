import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Los tests con base de datos usan un esquema aparte de PostgreSQL y lo recrean en cada test,
    // por eso los archivos corren de a uno.
    env: { DB_SCHEMA: 'pruebas' },
    fileParallelism: false,
  },
});
