---
title: "Auditoría de Secrets y Entropía en Client-Side: Arquitectura Zero-Trust en el Navegador"
slug: "auditoria-secrets-client-side"
date: "2024-10-15"
readTime: "6 min de lectura"
readTimeEn: "6 min read"
category: "Ciberseguridad"
categoryEn: "Cybersecurity"
tags: ["AppSec", "Zero-Trust", "Web Crypto API", "DevSecOps"]
summary: "Análisis técnico sobre la detección estática de claves criptográficas y secretos en frontend mediante Shannon Entropy y CSP nivel 3 sin emitir telemetría de red."
summaryEn: "Technical analysis on client-side static secret detection using Shannon Entropy and CSP Level 3 with zero network telemetry."
---

La fuga involuntaria de variables de entorno y credenciales en repositorios de código abierto o builds de frontend constituye uno de los vectores de ataque más recurrentes según el **OWASP Top 10 (A02: Cryptographic Failures / A05: Security Misconfiguration)**. En arquitecturas modernas, tokens de proveedores como Stripe, OpenAI, AWS o Firebase a menudo se filtran a través de archivos `.env` mal configurados o subidos por descuido.

En este artículo exploramos cómo construir una herramienta de auditoría de configuración determinista y local que ejecute **análisis heurístico y entropía de Shannon** íntegramente en el navegador, bajo un modelo **Zero-Trust** sin transmitir un solo byte a la red.

---

## 1. El Riesgo: Entropía y Firmas de Secretos

La mayoría de los secretos de infraestructura presentan una de dos características fundamentales:
1. **Patrones sintácticos conocidos (Regex):** Prefijos fijos como `sk_live_` (Stripe), `ghp_` (GitHub), `AKIA` (AWS Access Key ID) o encabezados JWT `ey...`.
2. **Alta densidad de información aleatoria (Entropía):** Claves privadas, hashes y salts generados mediante CSPRNG que carecen de palabras de diccionario y tienen una distribución uniforme de caracteres.

Para detectar estos últimos sin depender de listas cerradas de prefijos, recurrimos al cálculo de la **Entropía de la Información de Claude Shannon**:

$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$

```javascript
/**
 * Calcula la entropía de Shannon en bits por carácter
 * @param {string} str - Cadena a analizar
 * @returns {number} Entropía en rango [0, 8]
 */
export function calculateShannonEntropy(str) {
  if (!str || str.length === 0) return 0;

  const frequencies = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  const length = str.length;
  let entropy = 0;

  for (const char in frequencies) {
    const probability = frequencies[char] / length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}
```

Una cadena aleatoria en Base64 o Hexadecimal suele superar los **4.3 bits de entropía**, mientras que palabras normales en lenguaje natural se mantienen entre **1.5 y 3.0 bits**.

---

## 2. Modelo Zero-Trust: Aislamiento Criptográfico en Memoria

Para que un auditor de secretos sea seguro, el propio auditor no debe poder filtrar los datos examinados. Esto impone restricciones arquitectónicas estrictas:

```markdown
> [!SECURITY] // Security Baseline (OWASP Mitigation)
> Implementación de Content Security Policy (CSP Level 3) estricto: `default-src 'self'; connect-src 'none'; img-src 'self' data:; script-src 'self'`.
> La directiva `connect-src 'none'` garantiza a nivel de motor del navegador que ninguna petición `fetch`, `XMLHttpRequest` o `WebSocket` puede salir del sandbox hacia Internet.
```

### Procesamiento en Memoria Volátil

1. **Sin persistencia:** Ni el archivo `.env` ni los resultados se almacenan jamás en `localStorage`, `sessionStorage` o `IndexedDB`.
2. **Digest Criptográfico Determinista:** Para comprobar duplicados o referencias sin exponer la cadena original, se utiliza la **Web Crypto API**:

```javascript
async function generateSecretDigest(rawSecret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawSecret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
```

```markdown
> [!ARCHITECTURE] // Architecture & Impact
> Al combinar SHA-256 local y CSP connect-src 'none', el cliente obtiene garantías matemáticas de confidencialidad: el análisis es completamente auditable, inmutable y libre de fugas por canal lateral o exfiltración involuntaria.
```

---

## 3. Generación Automatizada de `.env.example` Sanitizado

Una práctica DevSecOps indispensable es proveer plantillas de entorno libres de valores reales. Durante el parsing del archivo:
- Se preservan comentarios, estructuras de secciones y nombres de variables.
- Se sustituyen los valores clasificados como confidenciales por placeholders informativos (`your_stripe_secret_key_here`, `postgres://user:password@localhost:5432/dbname`).
- Se genera un reporte con scoring de severidad: **CRITICAL** (claves privadas, JWT secrets), **WARNING** (URLs con credenciales inline), e **INFO** (puertos o configuraciones de depuración activas en producción).

---

## Conclusiones Técnicas

La seguridad aplicada al código no debe ser un obstáculo para la experiencia del desarrollador (DX). Construir herramientas de auditoría locales con arquitecturas Zero-Trust demuestra que es posible verificar el cumplimiento de normativas de seguridad desde las fases tempranas del ciclo de desarrollo (**Shift-Left Security**) sin comprometer la privacidad del proyecto ni requerir costosa infraestructura backend.
