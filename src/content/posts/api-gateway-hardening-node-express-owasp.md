---
title: "Endurecimiento de APIs en Node/Express: Arquitectura Defensiva contra el OWASP Top 10"
slug: "api-gateway-hardening-node-express-owasp"
date: "2024-09-15"
readTime: "9 min de lectura"
readTimeEn: "9 min read"
category: "Ciberseguridad"
categoryEn: "Cybersecurity"
tags: ["AppSec", "DevSecOps", "Nodejs", "OWASP", "Hardening"]
summary: "Patrones de diseño defensivo, rate-limiting distribuido, validación de esquemas y mitigación sistemática de vectores OWASP en servidores Node.js listos para producción."
summaryEn: "Defensive design patterns, distributed rate-limiting, strict schema validation, and systematic OWASP mitigation for production-grade Node.js servers."
---

La mayoría de los tutoriales de desarrollo backend enseñan a construir APIs funcionales, pero pocos abordan la realidad de exponer un servidor Node.js a la Internet pública: escaneos automatizados de vulnerabilidades, ataques de fuerza bruta, contaminación de parámetros HTTP y ataques de denegación de servicio a nivel de capa de aplicación (L7 DoS).

En este estudio de caso analizo la arquitectura de seguridad implementada en el proyecto **AppSec Auth & API Gateway Boilerplate**, un servidor base en Express endurecido desde el código para mitigar de forma sistemática los principales vectores del **OWASP Top 10**.

---

## 1. El Problema & Contexto de Negocio

El objetivo del proyecto era establecer un punto de partida (*baseline*) estandarizado para microservicios y aplicaciones web, evitando que los desarrolladores tengan que reescribir manualmente configuraciones de seguridad críticas en cada nuevo despliegue.

Las vulnerabilidades más comunes que debían erradicarse por diseño incluían:
- **A01: Broken Access Control:** Fuga de recursos por falta de verificación de propiedad de registros.
- **A03: Injection:** Inyección de operadores NoSQL en payloads JSON sin tipar.
- **A05: Security Misconfiguration:** Fuga de huellas de tecnología (cabecera `X-Powered-By: Express`) y stack traces de errores internos expuestos al cliente.
- **A07: Identification and Authentication Failures:** Ausencia de límites en endpoints de login y tokens sin caducidad estricta.

```markdown
> [!SECURITY] // Security Baseline (OWASP A05: Security Misconfiguration)
> Principio de Mínima Exposición: Ocultamiento obligatorio de cabeceras de fingerprinting, habilitación de HSTS (HTTP Strict Transport Security) con expiración de 1 año y políticas restrictivas de CORS limitadas exclusivamente a dominios explícitamente autorizados.
```

---

## 2. Arquitectura Defensiva: El Pipeline de Middlewares

La seguridad en Express debe operar como un embudo (*Defense in Depth*), donde cada petición pasa por filtros sucesivos antes de alcanzar los controladores de negocio:

```text
[HTTP Request]
       │
       ▼
[1. Helmet & Secure Headers]       ──> Mitiga XSS, clickjacking, MIME sniffing
       │
       ▼
[2. Rate Limiting por IP/Token]   ──> Previene fuerza bruta y DoS volumétrico
       │
       ▼
[3. CORS Guard & Size Limiter]     ──> Bloquea orígenes no válidos y payloads >10kb
       │
       ▼
[4. NoSQL / HPP Sanitization]      ──> Elimina $keys y parámetros duplicados
       │
       ▼
[5. JWT Verification & RBAC]       ──> Valida firma criptográfica y roles de acceso
       │
       ▼
[Route Controller]
```

### Implementación del Pipeline

```javascript
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

export function configureSecurityMiddlewares(app) {
  // 1. Cabeceras HTTP seguras
  app.use(helmet({
    contentSecurityPolicy: false, // Gestionado a nivel de CDN o frontend si es API pura
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // 2. Control de orígenes estricto
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // 3. Rate limiting contra fuerza bruta en autenticación
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 intentos por IP
    message: { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/auth/login', authLimiter);

  // 4. Prevenir HTTP Parameter Pollution (HPP)
  app.use(hpp());
}
```

---

## 3. Sanitización de Inputs & Mitigación de NoSQL Injection

En bases de datos como MongoDB, un atacante puede enviar un JSON como `{ "username": "admin", "password": { "$ne": null } }`. Si la consulta no está sanitizada, `$ne` evaluará como verdadero y el atacante obtendrá acceso como administrador sin conocer la contraseña.

```markdown
> [!ARCHITECTURE] // Architecture & Impact
> Para neutralizar este vector, se implementa validación de esquema determinista mediante bibliotecas de validación tipada (como Zod o Joi), verificando que `typeof req.body.password === 'string'` antes de interactuar con la base de datos.
```

---

## 4. Gestión Segura del Ciclo de Vida de Tokens JWT

Para evitar tokens con validez infinita o tokens comprometidos en el frontend:
- **Tokens de acceso de corta duración:** Los Access Tokens firman un tiempo de vida (*TTL*) de 15 minutos.
- **Refresh Tokens rotativos:** Almacenados en cookies `HttpOnly; Secure; SameSite=Strict`, impidiendo el acceso a través de JavaScript y mitigando ataques XSS.
- **Revocación centralizada:** Para soportar cierre de sesión forzado o cambio de contraseña, se implementó una lista de invalidación (*blacklist*) en Redis o campo de versión de token en la base de datos.

---

## 5. Manejo Centralizado de Excepciones y Observabilidad

Uno de los errores más graves en producción es responder con el error nativo `err.stack` al cliente. Esto revela versiones de Node, rutas absolutas del servidor en Linux y nombres de módulos internos:

```javascript
// Middleware central de control de errores
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log estructurado interno para auditoría
  console.error(`[SECURITY ERROR] ${req.method} ${req.url}:`, {
    message: err.message,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Respuesta al cliente sanitizada
  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 
      ? 'Ocurrió un error interno en el servidor.' 
      : err.message
  });
});
```

---

## Conclusión

El endurecimiento de una API en Node.js no consiste en añadir una sola biblioteca mágica, sino en aplicar una **cultura de defensa en profundidad**. Construir este boilerplate como base reutilizable reduce la superficie de ataque de cualquier aplicación antes de que se escriba la primera línea de lógica de negocio.
