# Majokacin — Web Oficial & Hero Cinematográfica 3D

Sitio web oficial de **Majokacin**, orientado al cuidado de la belleza, cosmética consciente, cuidado femenino y bienestar para el hogar.

El [plan de funcionalidades](./FEATURES.md) documenta los cambios de la portada y la navegación y sus criterios de aceptación.

---

## 🎨 Identidad & Paleta de Color
- **Identidad de Marca:** Logotipo oficial `logo.png` integrado tanto en la cabecera principal (`header`) como en el pie de página (`footer`).
- **Fondo Hero:** Rosa vivo `#f75591`
- **Halo Luminoso:** Rosa suave `#ff9ac0`
- **Acentos y Tipografía de Alto Contraste:** Tono **Vino Terciopelo / Berry Cálido** (`#50162f` / `#61183b` / `#46102a`), armónico con los tonos rosados y crema (`#fff1d9` / `#fff0dc`).
- **Botones e Interacciones:** `#61183b` con hover radiante `#7b1d4a`.

---

## 🌸 Secciones de la Web

1. **Hero Cinematográfica Interactiva (`#hero`):**
   - Cabecera con el logotipo oficial de **Majokacin** (`logo.png`).
   - Personaje cerámico **Mimo** (Three.js 0.186.0) con RoomEnvironment PMREM.
   - Seguimiento del cursor, parpadeo periódico y respiración suave.
   - Botón *«Despertar a Mimo»* (mueve orejas y brazo).
   - Accesible por teclado con flechas y Home (`tabindex="0"`).
   - Pausa automática de renderizado con `IntersectionObserver` al desplazarse.

2. **Productos en Tendencia con Modal de Galería (`#productos`):**
   - Filtros de categoría: *Todos*, *Cuidado Facial*, *Aromas & Hogar*, *Cuerpo & Mente*.
   - **Modal de Detalle de Producto (`#productModal`):**
     - Al hacer clic en cualquier tarjeta se abre una ventana modal con **galería de imágenes conmutables**.
     - Descripción profunda, ingredientes, ritual de aplicación y recomendación por tipo de piel.
     - Selector de presentación / tamaño (`30 ml / 50 ml`, tonos, etc.).
     - Stepper de cantidad (`-` / `+`) con cálculo de precio total.
     - Botón *«Añadir a la bolsa»* que actualiza el contador de la cabecera y muestra una notificación Toast.

3. **Catálogos Digitales & PDF (`#catalogos`):**
   - Sección de marcas aliadas y distribución: **Ésika**, **Yanbal**, **Dubu SAC** y **Natura**.
   - Botones directos para **abrir el catálogo digital** en una pestaña externa o **descargar / consultar el catálogo en PDF**.

4. **Novedades: Videos, Tendencias & Tips (`#novedades`):**
   - Tarjetas de video editorial con botón de reproducción interactivo y duración.
   - **Modal de Video & Tips interactivo (`#videoModal`):**
     - Reproductor simulado con barra de tiempo activa.
     - Pasos y consejos clave numerados.
     - Botón directo para explorar los productos recomendados.

5. **Contacto Directo (`#contacto`):**
   - Tarjetas de WhatsApp, correo electrónico y Almacén Lima SMP, adaptadas a móviles.
   - Enlaces directos con mensajes preparados que identifican las consultas desde la página web.

6. **Pie de Página (`footer`):**
   - Logotipo oficial de **Majokacin** (`logo.png`).
   - Enlaces a redes sociales: **TikTok**, **Instagram** y **Facebook** con iconos vectoriales SVG.
   - Enlaces a catálogos, colecciones y aviso legal.

---

## 🚀 Enlaces y Despliegue

- **Producción Vercel:** [https://majokacin.vercel.app](https://majokacin.vercel.app)
- **Repositorio GitHub:** [https://github.com/babafxd/MAJOKACIN-PAGE](https://github.com/babafxd/MAJOKACIN-PAGE)

---

## 💻 Desarrollo Local

- **Local:** [http://localhost:5180/](http://localhost:5180/)
- **Red local (móvil u otros dispositivos):** [http://192.168.3.234:5180/](http://192.168.3.234:5180/)
