# Plan de funcionalidades de Majokacin

## Portada y navegación superior

**Estado:** implementado. Se verificó la portada en Edge a 320, 390, 768 y 1440 px, incluido el modo con Mimo activo a 390 px. La compilación de producción completó correctamente.

La imagen adjunta al pedido sirve como referencia para la composición, la jerarquía visual y el estilo de los iconos. En escritorio, el titular, el texto y el CTA se agrupan a la izquierda, con espacio para que destaque la composición de productos a la derecha. La cabecera conserva la identidad rosa y vino de Majokacin y el texto de la portada mantiene el contraste sobre el fondo.

### 1. Actualizar el texto de portada

- [x] Sustituir el párrafo de `.hero-content` en `index.html` por el siguiente texto exacto.

  > Descubre una gran variedad de productos de belleza, cuidado personal, accesorios, hogar y mucho más en un solo lugar.

- [x] Ajustar el ancho y el interlineado del párrafo en `style.css` para que el texto se lea con comodidad sobre la imagen y fluya en pantallas estrechas.

### 2. Rediseñar el botón «Explorar Catálogo»

- [x] Cambiar el rótulo de «Explorar Tendencias» a **«Explorar Catálogo»**. El destino previsto es `#catalogos`, la sección de catálogos digitales. La opción Tendencias de la navegación sigue enlazando a `#productos`.
- [x] Incorporar un icono lineal de carrito a la izquierda y una flecha corta a la derecha. Dar al CTA forma de píldora, con degradado de fucsia a vino, texto blanco y una sombra rosada suave, como en la referencia.
- [x] Aplicar una transición breve de elevación y desplazamiento de la flecha al pasar el cursor. Añadir foco visible y respuesta al pulsar. Con `prefers-reduced-motion: reduce`, usar cambios de color o sombra sin desplazamiento.
- [x] Mantener el CTA visible con y sin Mimo. Cuando Mimo esté activo, mostrar «Despertar a Mimo» como acción secundaria y comprobar el espacio disponible para ambas acciones.

### 3. Incorporar iconos a la navegación

- [x] Añadir «Inicio» con icono de casa y destino `#hero`. Aplicar el indicador rosa de sección activa que muestra la referencia.
- [x] Acompañar Tendencias con una etiqueta, Catálogos con capas, Novedades con destellos y Contacto con un sobre. Usar iconos lineales de tamaño y grosor consistentes, alineados con sus rótulos y en el mismo color vino.
- [x] Añadir a Bolsa en la cabecera principal el icono de bolsa ya presente en la barra flotante. Conservar el contador y la apertura de la bolsa. En móvil, usar la misma familia de iconos en el menú desplegable y mantener visibles las etiquetas.
- [x] Ajustar `index.html` y `style.css` en la cabecera, la barra flotante y el menú móvil. Revisar en `main.js` la detección de la sección activa para incluir Inicio donde corresponda. Marcar los iconos que acompañan texto como decorativos para evitar que los lectores de pantalla repitan las etiquetas.

### Criterios de aceptación

- [x] En escritorio, el conjunto de texto y CTA queda a la izquierda y el contenido visual a la derecha, con un balance similar al de la referencia.
- [x] En móvil y tableta, el párrafo y el botón se leen completos, los elementos no se solapan y la página no presenta desplazamiento horizontal.
- [x] El CTA lleva a Catálogos y la barra flotante deja visible el encabezado de destino. Inicio vuelve a la portada y Bolsa abre su panel con el contador correcto.
- [x] La navegación y el CTA funcionan con ratón, teclado y toque. El foco se distingue sobre el fondo y el botón se puede usar con movimiento reducido.
- [x] Verificar la portada con Mimo activado y desactivado y ejecutar `npm run build`.
