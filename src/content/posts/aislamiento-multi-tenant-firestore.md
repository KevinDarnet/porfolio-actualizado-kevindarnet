---
title: "Aislamiento Multi-Tenant en Firestore: Modelado de Datos y Reglas de Seguridad Granulares"
slug: "aislamiento-multi-tenant-firestore"
date: "2024-11-02"
readTime: "8 min de lectura"
readTimeEn: "8 min read"
category: "Desarrollo"
categoryEn: "Development"
tags: ["WebDev", "Architecture", "NoSQL", "Cloud"]
summary: "Patrones de diseño para arquitecturas SaaS multi-inquilino en bases de datos NoSQL documentales, garantizando segregación lógica estricta y bajo coste computacional."
summaryEn: "Design patterns for multi-tenant SaaS architectures in NoSQL document databases, ensuring strict logical segregation and low compute cost."
---

El desarrollo de aplicaciones **Software as a Service (SaaS)** multi-tenant plantea un desafío constante: ¿cómo garantizar un aislamiento riguroso entre diferentes organizaciones sin incurrir en la sobrecarga de desplegar y mantener una base de datos física independiente para cada cliente?

En plataformas NoSQL basadas en documentos como **Google Cloud Firestore**, el modelo de datos y las **Reglas de Seguridad (Security Rules)** son la primera y última línea de defensa. Una regla mal configurada no solo puede comprometer la privacidad de una empresa, sino exponer registros masivos ante consultas no acotadas.

En este artículo analizamos cómo estructurar colecciones jerárquicas y escribir reglas granulares basadas en **Custom Claims de JWT** para lograr una segregación multi-inquilino hermética y escalable.

---

## 1. Estrategias de Modelado: Root Collections vs Subcolecciones Anidadas

En Firestore existen dos aproximaciones principales para organizar datos multi-empresa:

### A. Subcolecciones Jerárquicas por Tenant (Recomendada)
La estructura encapsula todos los recursos bajo la ruta raíz del inquilino:

```text
/tenants/{tenantId}/projects/{projectId}
/tenants/{tenantId}/users/{userId}
/tenants/{tenantId}/invoices/{invoiceId}
```

- **Ventajas:** Permite aplicar reglas en cascada basadas en la ruta (`/tenants/{tenantId}/...`). Facilita la eliminación masiva de datos (GDPR / "Derecho al Olvido") al borrar el tenant.
- **Consultas acotadas:** Las búsquedas quedan automáticamente restringidas al subárbol del tenant sin riesgo de cruzar fronteras.

### B. Colecciones Raíz con Campo Discriminador
```text
/projects/{projectId} -> { tenantId: "org_4821", name: "Alpha", ... }
```
- **Riesgo:** Requiere que cada consulta en el frontend incluya obligatoriamente `.where('tenantId', '==', userTenantId)`. Si el desarrollador olvida el filtro, la consulta fallará o dependerá exclusivamente de la regla de seguridad para ser rechazada.

```markdown
> [!ARCHITECTURE] // Architecture & Impact
> Optar por subcolecciones anidadas garantiza que la autorización esté embebida en la topología de la base de datos. Ninguna query puede escapar de su subárbol sin que el path explícito lo declare.
```

---

## 2. Inyección de Contexto en JWT: Custom Claims

En lugar de consultar la base de datos en cada regla para verificar a qué organización pertenece el usuario (lo cual consume lecturas de cuota y añade latencia), inyectamos el `tenantId` y su rol (`role`) directamente en el token de autenticación mediante Firebase Admin SDK en el backend:

```javascript
// Backend Node.js / Cloud Function
await admin.auth().setCustomUserClaims(userId, {
  tenantId: 'tenant_omega_09',
  role: 'admin',
  permissions: ['projects:write', 'billing:read']
});
```

---

## 3. Reglas de Seguridad Granulares y Eficientes

Con el `tenantId` disponible en `request.auth.token`, las reglas de Firestore pueden evaluar el acceso con coste computacional **cero lecturas**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions para sanitización y control de contexto
    function isAuthenticated() {
      return request.auth != null;
    }

    function isMemberOfTenant(tenantId) {
      return isAuthenticated() && 
             request.auth.token.tenantId == tenantId;
    }

    function hasRole(requiredRole) {
      return request.auth.token.role == requiredRole;
    }

    // Aislamiento hermético a nivel de Tenant
    match /tenants/{tenantId} {
      allow read: if isMemberOfTenant(tenantId);
      allow write: if isMemberOfTenant(tenantId) && hasRole('owner');

      // Subcolección de proyectos
      match /projects/{projectId} {
        allow read: if isMemberOfTenant(tenantId);
        allow create, update: if isMemberOfTenant(tenantId) && 
                                 request.resource.data.tenantId == tenantId;
        allow delete: if isMemberOfTenant(tenantId) && hasRole('admin');
      }

      // Subcolección financiera restringida
      match /invoices/{invoiceId} {
        allow read, write: if isMemberOfTenant(tenantId) && 
                              (hasRole('admin') || hasRole('billing'));
      }
    }
  }
}
```

```markdown
> [!SECURITY] // Security Baseline (OWASP A01: Broken Access Control)
> La regla `request.resource.data.tenantId == tenantId` previene ataques de suplantación o reasignación de tenant al crear o actualizar documentos, asegurando consistencia inmutable en la metadata.
```

---

## 4. Índices Compuestos y Rendimiento en Consultas

En Firestore, cada consulta está respaldada por un índice. Al utilizar subcolecciones jerárquicas, los índices se limitan al ámbito del subárbol:

- **Collection Group Queries:** Si en el futuro necesitas realizar una agregación global administrativa (por ejemplo, buscar proyectos activos en toda la plataforma por un superadmin), puedes definir una consulta de grupo de colecciones (`collectionGroup('projects')`) con una regla específica reservada exclusivamente para el claim `role == 'superadmin'`.

---

## Conclusión

El aislamiento multi-tenant robusto en NoSQL no requiere una infraestructura sobrediseñada ni duplicar clústeres de base de datos. Una arquitectura de subcolecciones jerárquicas combinada con **Custom Claims de JWT** y reglas declarativas de Firestore ofrece:

1. **Aislamiento lógico matemáticamente verificado** sin fugas de datos.
2. **Latencia ultra-baja**, al no requerir queries secundarias en el motor de autorización.
3. **Escalabilidad horizontal lineal**, delegando el particionado en la nube de Google.
