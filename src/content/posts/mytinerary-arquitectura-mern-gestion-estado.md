---
title: "Diseño de Arquitectura MERN y Sincronización Global de Estado para Plataformas de Turismo"
slug: "mytinerary-arquitectura-mern-gestion-estado"
date: "2024-08-20"
readTime: "8 min de lectura"
readTimeEn: "8 min read"
category: "Desarrollo"
categoryEn: "Development"
tags: ["MERN", "ReduxToolkit", "RESTAPI", "Architecture", "Auth"]
summary: "Retrospectiva sobre el modelado relacional en MongoDB, normalización de estado con Redux Toolkit y control de mutaciones con JWT en una plataforma colaborativa de itinerarios."
summaryEn: "Engineering case study on relational modeling in MongoDB, state normalization with Redux Toolkit, and JWT mutation controls in a collaborative travel platform."
---

Las plataformas de viajes y descubrimiento de ciudades operan bajo una tensión técnica clásica: los usuarios necesitan explorar catálogos densos con filtros reactivos inmediatos, mientras que la capa de datos debe soportar relaciones heterogéneas entre destinos, itinerarios creados por la comunidad, valoraciones, presupuestos y perfiles de autor.

En este estudio de caso analizo las decisiones de ingeniería detrás de **MyTinerary**, evaluando el modelado de datos en **MongoDB**, la estrategia de normalización de estado con **Redux Toolkit** y la implementación de controles de seguridad en mutaciones de contenido.

---

## 1. El Problema & Contexto de Negocio

El objetivo central era superar la lentitud típica de los sitios de turismo que recargan vistas o disparan peticiones redundantes cada vez que el usuario filtra por ciudad, rango de duración o etiquetas temáticas (`#gastronomia`, `#senderismo`).

Desde la perspectiva del usuario:
- La navegación entre ciudades e itinerarios debía ser instantánea, manteniendo el histórico de búsqueda sin perder el estado del scroll ni reiniciar los filtros.
- Los itinerarios creados por los usuarios requerían un desglose granular: autor, precio estimado (escala 1 a 5), duración en horas, hashtags y un módulo de actividades recomendadas.

```markdown
> [!ARCHITECTURE] // Architecture & Impact
> Diseñar una SPA desacoplada con backend RESTful permitió aislar la computación de catálogos en el cliente, reduciendo drásticamente las llamadas al servidor durante la interacción exploratoria y mitigando cuellos de botella en la base de datos documental.
```

---

## 2. Arquitectura del Sistema & Modelado de Datos

En bases de datos NoSQL como MongoDB, la disyuntiva entre **embebido** (*embedded documents*) y **referencia** (*normalized references*) determina directamente el rendimiento de lectura y la complejidad de las mutaciones.

### Estrategia de Modelado Híbrido

Para MyTinerary se optó por un esquema normalizado a nivel de entidades principales (Ciudades e Itinerarios) y embebido para actividades y tags:

```javascript
// Esquema conceptual de Itinerario en Mongoose
const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true, index: true },
  author: {
    name: { type: String, required: true },
    photo: { type: String, required: true }
  },
  price: { type: Number, min: 1, max: 5, required: true },
  duration: { type: Number, required: true }, // en horas
  hashtags: [{ type: String, trim: true }],
  activities: [{
    name: { type: String, required: true },
    photo: { type: String, required: true }
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
```

- **Indexación estratégica:** El índice compuesto en `{ city: 1, price: 1 }` permite consultas en tiempo submilisegundo para poblar itinerarios específicos sin escanear colecciones completas (`COLLSCAN`).

### Gestión de Estado Global con Redux Toolkit

Para evitar el temido *prop drilling* y re-renders descontrolados en el catálogo de ciudades, se implementaron slices especializados:

1. `citiesSlice`: Almacena el catálogo base en memoria y administra el filtrado reactivo sincrónico (`searchFilter` y `selectedContinent`).
2. `itinerariesSlice`: Administra el fetch bajo demanda mediante `createAsyncThunk`, cacheando los itinerarios consultados por `cityId` para evitar peticiones repetidas si el usuario regresa a una ciudad ya visitada.

---

## 3. Seguridad & Hardening (AppSec)

Un error frecuente en plataformas colaborativas es confiar en la identidad provista en el cuerpo de la petición (*payload*). Para proteger la integridad de los datos se aplicaron tres principios defensivos:

```markdown
> [!SECURITY] // Security Baseline (OWASP A01: Broken Access Control)
> En toda mutación (`POST`, `PUT`, `DELETE`), el backend extrae y verifica la identidad del usuario exclusivamente a partir del token JWT firmado en las cabeceras `Authorization: Bearer <token>`, ignorando cualquier `userId` enviado en el cuerpo JSON.
```

- **Mitigación de NoSQL Injection:** Sanitización preventiva de operadores MongoDB (`$gt`, `$ne`, `$where`) mediante validación estricta de esquemas con middleware de inspección de queries antes de alcanzar los controladores.
- **Hashing de Contraseñas:** Encriptación de credenciales con `bcryptjs` utilizando un factor de costo (*salt rounds*) calibrado para balancear seguridad criptográfica y tiempo de respuesta en el handshake de autenticación.

---

## 4. Experiencia de Usuario (UX/UI) & Rendimiento

- **Tarjetas de Itinerarios Progresivas:** Para no sobrecargar visualmente la pantalla con galerías pesadas de imágenes de actividades, se implementó un patrón de disclosure progresivo mediante acordeones interactivos colapsables con transiciones CSS fluidas.
- **Skeletons & Estados de Carga:** En lugar de spinners genéricos centrados que provocan saltos de maquetación (*Cumulative Layout Shift*), se utilizaron tarjetas skeleton pulsantes que preservan la geometría exacta del grid mientras finaliza el fetching de datos.

---

## 5. Lecciones Aprendidas & Retrospectiva

- **Normalización de Redux:** Redux Toolkit simplifica enormemente la gestión del estado, pero es crucial normalizar las entidades (`createEntityAdapter`) para evitar duplicaciones en colecciones anidadas complejas.
- **Siguiente paso arquitectónico:** En una siguiente iteración, reemplazaría el polling o re-fetching de likes por una arquitectura dirigida por eventos con WebSockets o Server-Sent Events (SSE) para reflejar la concurrencia de la comunidad en tiempo real.
