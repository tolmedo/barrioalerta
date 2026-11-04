import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Los tests de repositorios usan un esquema aparte de PostgreSQL y lo recrean en cada test.
    env: { DB_SCHEMA: 'pruebas' },
  },
});
