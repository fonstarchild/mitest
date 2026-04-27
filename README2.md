## Cómo arrancar

```bash
docker-compose up
```

Eso es todo. El servidor arranca en `localhost:3000` y el cliente en `localhost:5173`. El primer arranque tarda un par de minutos mientras Docker construye las imágenes y descarga dependencias.

Si prefieres trabajar sin Docker (más cómodo para desarrollo activo):

```bash
# Terminal 1 — servidor
yarn start

# Terminal 2 — cliente
cd client && npm run dev
```

Para los tests:

```bash
cd client
npm test           # unitarios + accesibilidad (46 tests, ~2s)
npm run test:e2e   # Playwright, requiere docker-compose up corriendo
```

---

## Stack elegido

**Vite + React 19 + TypeScript.** Sin Next.js. La prueba es una SPA sin necesidad de SSR ni rutas complejas, y Next añadiría una capa de complejidad que no aporta nada aquí. Vite arranca en menos de un segundo y el DX es difícilmente superable para este tipo de proyecto.

**Styled-components v6.** Lo más cercano a lo que usáis. No me he querido mojar con vanilla-extract por desconocimiento y porque quería dedicarle de 3 a 4 horas, como lo sugerido.

**TanStack Query v5.** Para el estado del servidor. Tentado de usar Redux que es mi fuerte, pero si usáis TanStack es lo mejor. Lo he refrescado bien y mola.

**React Hook Form + Zod.** Los formularios de compra/venta/traspaso tienen validaciones que dependen de datos externos (el saldo de la posición, el límite de 10.000€). Zod permite construir el schema dentro del componente con esos valores como closure, lo que hace que la lógica de validación viva en un único sitio y sea testeable de forma independiente. RHF se encarga de la integración con el DOM sin re-renders innecesarios.

---

## Arquitectura

La estructura sigue el patrón **features-first** en lugar de type-first:

```
src/
  api/           → funciones de fetch tipadas, una por recurso
  components/    → átomos reutilizables sin lógica de negocio
  features/
    funds/       → listado de fondos + diálogo de compra
    portfolio/   → cartera + venta + traspaso
  hooks/         → hooks genéricos (useSortState, useDisclosure)
  styles/        → tema, estilos globales, declaración de tipos
  types/         → contratos del dominio
  test/          → infraestructura de tests (MSW, helpers, E2E)
```

La decisión de separar `funds/` y `portfolio/` como features distintas no es arbitraria: son dos contextos con responsabilidades diferentes. Los fondos son un catálogo de solo lectura más la acción de compra. La cartera es el estado del usuario más las acciones de venta y traspaso. Mezclarlos habría generado un módulo con demasiadas razones para cambiar.

La capa `api/` es deliberadamente tonta: solo hace fetch y tipado. Sin lógica de negocio, sin estado, sin side effects. La lógica de cuándo llamar, cuándo invalidar y qué hacer con los errores vive en los componentes que usan React Query.

---

## El `<dialog>` nativo

Usé el elemento `<dialog>` de HTML en lugar de construir un modal con `div` + portal de React. Hay una razón de accesibilidad concreta: el dialog nativo gestiona automáticamente el foco (lo mueve al dialog al abrirse y lo restaura al cerrarse), el `aria-modal`, y el Escape. Con un div tendrías que reimplementar todo eso a mano y es fácil dejarse algo.

El único problema es que jsdom (el entorno de tests) no implementa `showModal()`. Lo solucioné con un mock en el setup de tests que simula el comportamiento básico.

La animación de entrada/salida requirió un pequeño truco: el `if (!isOpen) return null` habitual desmonta el nodo antes de que pueda animar la salida. La solución fue un estado `visible` separado que se mantiene `true` durante los 220ms que dura la animación, y solo entonces desmonta el componente. El centrado usa `position: fixed` con `transform: translate(-50%, -50%)` para anular el posicionamiento por defecto del navegador, que en algunos browsers deja el dialog en la esquina superior izquierda.

## Fon, pero podrias haber usado MUI o cualquier cosa

Si, es correcto amigo mío. Pero leñes, ya que tenemos a la IA como aliada, vamos a usarla :D

---

## Los tests

Empecé escribiendo los tests antes del código (TDD). No porque sea una práctica religiosa sino porque en este caso tiene sentido práctico: los formularios con validaciones complejas son difíciles de razonar sin tests, y los tests te fuerzan a pensar en los contratos del componente antes de pensar en la implementación.

**MSW (Mock Service Worker)** intercepta los requests HTTP en los tests sin tocar el código de producción. El mismo mecanismo funciona en el navegador y en Node, lo que significa que los tests unitarios y los E2E comparten la misma capa de mocks.

**axe-core** para accesibilidad. Tres tests que corren el analizador de accesibilidad sobre las vistas principales y fallan si hay violaciones. No cubren todo (el contraste de color requiere canvas y jsdom no lo implementa) pero sí cogen errores de estructura.

**Playwright** para E2E. Configurado para Chrome y Safari móvil. Los tests E2E no corren en el pipeline de `npm test` porque necesitan el servidor real; tienen su propio script `npm run test:e2e`.

---

## El diseño

Aqui me he divertido un poquitín con vuestra bendición y le he dado un toquecito sutil andaluz. La paleta tiene nombre propio porque me parece más chuli que llamarles `primary-500` o `blue-700`:

- **Azul Albaicín** (`#1A4F8A`) — el azul de los azulejos sevillanos. Color principal, botones, enlaces.
- **Blanco cal** (`#FAFAF7`) — el blanco de las fachadas encaladas. Fondo de la aplicación.
- **Terracota / almagra** (`#C0392B`) — la tierra roja de Ronda. Errores, botón de venta.
- **Verde aceituna** (`#2E7D52`) — los olivares de Jaén. Rentabilidades positivas.
- **Amarillo albero** (`#C9842A`) — la arena de la plaza de la Giralda. Warnings.

La tipografía usa **Lora** (serif) para los títulos, que le da un carácter más editorial, e **Inter** para el cuerpo. Los valores numéricos (precios, rentabilidades) usan **JetBrains Mono** porque la fuente monoespaciada alinea los decimales correctamente en tablas sin trucos de CSS.

---

## Docker

El servidor usa yarn con el binario incluido en el repositorio (`.yarn/releases/`). El `Dockerfile.server` copia solo esa carpeta de releases, no el caché completo de yarn, para evitar conflictos con el estado interno del caché entre el host y el contenedor.

El cliente usa npm (sin yarn) para independizarlo del setup de yarn del servidor. No tiene sentido acoplar los gestores de paquetes de dos proyectos distintos.

El proxy de Vite (`/api → server:3000`) se configura vía variable de entorno `API_PROXY_TARGET`, de forma que en desarrollo local apunta a `localhost:3000` y dentro de Docker apunta al servicio `server` por nombre de red. El navegador siempre llama a `/api` (relativo), Vite hace el resto.

---

## Qué mejoraría con más tiempo

- **Rutas reales con React Router.** Ahora el "router" es un `useState` en `App.tsx`. Funciona, pero perderías el historial del navegador y no podrías compartir una URL a la cartera.

- **Skeleton loaders** en lugar del spinner. El spinner funciona pero los skeletons evitan el layout shift y son más agradables visualmente.

- **Swipe en móvil** para las acciones de la cartera. El README original lo menciona como bonus. Habría usado `@use-gesture/react`.

- **Categoría real en `/portfolio`.** Ahora el endpoint `/portfolio` no devuelve la categoría del fondo, así que la agrupación en la cartera la infiero heurísticamente del nombre. En producción el backend debería incluirla o habría que hacer un join en el cliente contra `/funds`.

- **Internacionalización.** Los textos están en español hardcodeado. Si esto fuera un producto real, habría usado `react-i18next` desde el principio.

- **Error boundaries.** Hay manejo de errores a nivel de query pero no un boundary global que capture errores de renderizado inesperados.
