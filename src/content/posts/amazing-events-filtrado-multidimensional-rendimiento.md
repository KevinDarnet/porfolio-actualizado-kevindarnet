---
title: "Filtrado Multidimensional en Cliente y Gestión Reactiva de Datos sin Frameworks Pesados"
slug: "amazing-events-filtrado-multidimensional-rendimiento"
date: "2024-07-10"
readTime: "7 min de lectura"
readTimeEn: "7 min read"
category: "Frontend"
categoryEn: "Frontend"
tags: ["JavaScript", "VanillaJS", "UIUX", "Performance", "Algorithms"]
summary: "Diseño de un motor de filtrado cruzado en memoria y procesamiento algorítmico de métricas de concurrencia en JavaScript puro con mínima huella de cómputo."
summaryEn: "Designing an in-memory cross-filtering engine and algorithmic concurrency analytics in Vanilla JavaScript with near-zero runtime footprint."
---

El ecosistema actual de desarrollo web tiende a depender de librerías reactivas masivas para resolver problemas que el estándar moderno de **JavaScript (ES6+)** puede solucionar con mayor ligereza, mejor rendimiento y cero sobrecarga de bundle.

En este estudio de caso analizo la ingeniería detrás de **Amazing Events**, una plataforma interactiva de gestión cultural desarrollada en JavaScript nativo, enfocada en la resolución de dos desafíos centrales: un **motor de filtrado multidimensional en tiempo real** y un **pipeline de cálculo estadístico** para métricas de asistencia y rendimiento económico.

---

## 1. El Problema & Contexto de Negocio

La plataforma debía centralizar cientos de eventos (conciertos, ferias de libros, congresos y exposiciones) clasificados en categorías dinámicas, distinguiendo eventos pasados de futuros.

El requerimiento de experiencia de usuario exigía:
1. **Filtrado cruzado simultáneo:** El usuario debe poder combinar una búsqueda por texto libre con múltiples checkboxes de categorías activas sin colisión lógica.
2. **Cómputo instantáneo de estadísticas:** Calcular en tiempo real qué eventos tuvieron mayor y menor porcentaje de asistencia sobre la capacidad proyectada, así como los ingresos brutos generados por categoría temática.

```markdown
> [!ARCHITECTURE] // Architecture & Impact
> Al procesar el filtrado y las estadísticas 100% en el cliente mediante operaciones inmutables en memoria, se eliminó la latencia de ida y vuelta a la red (RTT), logrando respuestas visuales de menos de 16ms (60 FPS garantizados).
```

---

## 2. Arquitectura del Motor de Filtrado Cruzado

El error más común al programar filtros en Vanilla JS es encadenar manejadores de eventos independientes que sobrescriben el estado del otro. La solución consistió en diseñar una función de composición pura (*pipeline*) que toma el array de eventos y aplica una función reductora de predicados:

```javascript
/**
 * Pipeline de filtrado puro en memoria
 */
function applyCrossFilters(events, { searchText, selectedCategories }) {
  const normalizedSearch = searchText.trim().toLowerCase();

  return events.filter((event) => {
    // 1. Predicado de texto libre (busca en nombre y descripción)
    const matchesText =
      normalizedSearch === '' ||
      event.name.toLowerCase().includes(normalizedSearch) ||
      event.description.toLowerCase().includes(normalizedSearch);

    // 2. Predicado de categorías (OR inclusivo entre checkboxes)
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(event.category);

    return matchesText && matchesCategory;
  });
}
```

### Mitigación de Reflows y Manipulación Eficiente del DOM

Para evitar repintados continuos (*layout thrashing*) al actualizar el grid de tarjetas:
- Se utiliza `DocumentFragment` o un acumulador de strings HTML inyectado en una única operación `innerHTML`.
- Se desacopló la generación de los checkboxes de categorías para que el panel se adapte dinámicamente a las categorías que existan en el payload de la API, sin hardcodear opciones fijas.

---

## 3. Algoritmos de Analítica y Estadísticas

Para la vista analítica, la aplicación procesa los eventos pasados y futuros ejecutando agregaciones mediante `Array.prototype.reduce`:

```javascript
// Cálculo de porcentajes de asistencia y eventos destacados
function calculateAttendanceMetrics(pastEvents) {
  return pastEvents.reduce((acc, event) => {
    const attendanceRate = (event.assistance / event.capacity) * 100;

    if (!acc.highest || attendanceRate > acc.highest.rate) {
      acc.highest = { name: event.name, rate: attendanceRate };
    }
    if (!acc.lowest || attendanceRate < acc.lowest.rate) {
      acc.lowest = { name: event.name, rate: attendanceRate };
    }
    if (!acc.maxCapacity || event.capacity > acc.maxCapacity.capacity) {
      acc.maxCapacity = { name: event.name, capacity: event.capacity };
    }

    return acc;
  }, { highest: null, lowest: null, maxCapacity: null });
}
```

```markdown
> [!SECURITY] // Security Baseline (Client-Side Integrity)
> En el procesamiento de inputs de búsqueda libre se realiza sanitización contra inyección de HTML y Cross-Site Scripting (XSS) mediante escape de caracteres especiales antes de cualquier interpolación en el árbol del DOM.
```

---

## 4. Experiencia de Usuario (UX/UI): Feedback de Estado Vacío

Un aspecto crítico de la usabilidad en motores de búsqueda es la gestión del estado "sin resultados". En lugar de dejar un espacio en blanco o romper el grid:
- Se diseñó un contenedor visual específico que informa al usuario que ninguna tarjeta coincide con la combinación de filtros actual.
- Se ofrece un enlace de reinicio rápido (*Reset Filters*) que limpia los inputs y restaura el catálogo completo sin recargar la página.

---

## 5. Lecciones Aprendidas

- **El valor de los fundamentos:** Trabajar sin frameworks refuerza la comprensión profunda del ciclo de vida del DOM, la propagación de eventos (*event bubbling*) y la importancia de la inmutabilidad de datos en JavaScript.
- **Transición a frameworks:** Este tipo de lógica modular desacoplada sienta las bases perfectas para migrar posteriormente a bibliotecas declarativas como React, ya que la separación entre estado y vista ya se encuentra conceptualmente aislada.
