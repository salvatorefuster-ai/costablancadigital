# Google Maps Web Scout - Benidorm

Este script automatizado busca negocios en Benidorm a través de Google Maps y extrae información clave, incluyendo sus sitios web (si están disponibles).

## Requisitos

- Node.js instalado
- Google Chrome instalado (Puppeteer usará su propia versión o la del sistema)

## Instalación

Si no lo has hecho ya, instala las dependencias:

```bash
npm install
```

## Uso

Para ejecutar el script y comenzar el análisis:

```bash
npm start
```

## Configuración

El script `scout.js` está configurado por defecto para buscar "restaurantes en Benidorm".
Puedes editar la variable `query` en la línea 27 de `scout.js` para buscar otros tipos de negocios (ej: "hoteles en Benidorm", "talleres en Benidorm").

## Resultados

Los resultados se guardarán automáticamente en un archivo `negocios_benidorm.json` en este mismo directorio.
El formato del JSON será:

```json
[
  {
    "name": "Nombre del Negocio",
    "googleMapsUrl": "https://...",
    "website": "https://susitioweb.com"
  },
  ...
]
```
