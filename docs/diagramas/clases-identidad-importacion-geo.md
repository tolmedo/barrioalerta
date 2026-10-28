# Diagrama de clases — Identidad, Importación y Geo

**Estado:**
- **Identidad:** implementado (`identidad/dominio`). Login JWT en H1.
- **Importación y Geo:** propuestos (H3, I7).

## Identidad (C04 · usuarios, roles y permisos)

```mermaid
classDiagram
direction LR

class Usuario {
  -String username
  +Usuario SISTEMA$
  +tenesPermiso(Permiso permiso) boolean
  +esSistema() boolean
}
class Rol {
  -String nombre
  +tenesPermiso(Permiso permiso) boolean
}
class Permiso {
  <<enumeration>>
  REPORTAR_INCIDENTE
  ADHERIR_INCIDENTE
  GESTIONAR_INCIDENTES
  ASIGNAR_CUADRILLAS
  EJECUTAR_TRABAJOS
  ADMINISTRAR_CONFIGURACION
  IMPORTAR_DATOS
  OPERAR_DEMO
}
class TipoCanal {
  <<enumeration>>
  IN_APP
  EMAIL
  WHATSAPP
}
Usuario "*" --> "1" Rol : rol
Rol "*" --> "*" Permiso : permisos
```

> Operador y Admin no son clases: son roles. Solo tienen entidad propia los actores con relaciones de dominio (`Vecino`, miembros de `Cuadrilla`), como plantea C04.

## Importación CSV — Template Method (C03)

```mermaid
classDiagram
direction LR

class ImportadorCsv~T~ {
  <<abstract>>
  +importar(InputStream archivo) ResultadoImportacion
  #validarFila(String[] columnas) List~String~*
  #mapear(String[] columnas) T*
  #guardarLote(List~T~ lote)*
  -tamanioDeLote int
}
class ImportadorIncidentesHistoricos {
  #validarFila(String[] columnas) List~String~
  #mapear(String[] columnas) Incidente
  #guardarLote(List~Incidente~ lote)
}
class ImportadorCuadrillas {
  #validarFila(String[] columnas) List~String~
  #mapear(String[] columnas) Cuadrilla
  #guardarLote(List~Cuadrilla~ lote)
}
class ResultadoImportacion {
  <<record>>
  int filasLeidas
  int filasImportadas
  List~ErrorDeFila~ errores
}
ImportadorCsv <|-- ImportadorIncidentesHistoricos
ImportadorCsv <|-- ImportadorCuadrillas
ImportadorCsv ..> ResultadoImportacion
```

`importar()` es el algoritmo fijo (y `final`): leer → validar fila → mapear → acumular → guardar en lotes de 500 → reportar errores por número de fila. Las subclases solo definen los pasos variables.

## Geo — puerto y adaptadores (C06 · Adapter; C22 · Hexagonal)

```mermaid
classDiagram
direction LR

class Geocodificador {
  <<interface puerto · módulo incidentes>>
  +resolver(double latitud, double longitud) Ubicacion
}
class GeorefAdapter {
  <<Adapter · API Georef>>
  -RestClient cliente
  -Duration timeout
  +resolver(double latitud, double longitud) Ubicacion
}
class GeocodificadorOffline {
  <<Adapter · perfil demo>>
  -List~PoligonoBarrio~ barrios
  +resolver(double latitud, double longitud) Ubicacion
}
Geocodificador <|.. GeorefAdapter
Geocodificador <|.. GeocodificadorOffline
```

`GeorefAdapter` traduce la respuesta de `GET /ubicacion?lat=&lon=` (C02 · SmartLife) a `Ubicacion`. El perfil `demo` usa `GeocodificadorOffline` para no depender de internet.
