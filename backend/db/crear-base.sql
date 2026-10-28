-- Crea el usuario y la base de desarrollo/demo en un PostgreSQL instalado nativo.
-- Uso (pide la contraseña del usuario postgres que se eligió al instalar):
--   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -f backend\db\crear-base.sql
-- Con Docker no hace falta: docker-compose.yml ya crea lo mismo.

CREATE ROLE barrioalerta LOGIN PASSWORD 'barrioalerta';
CREATE DATABASE barrioalerta OWNER barrioalerta ENCODING 'UTF8';
