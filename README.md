# Página de cumpleaños — guía rápida

Una experiencia React + Vite con animaciones GSAP, diseñada primero para escritorio y adaptada para móvil.

## Arrancarla

```powershell
npm install
npm run dev
```

## Personalizarla

Abre `src/story.js`. Ahí está todo el contenido de ejemplo, preparado para reemplazarlo por su historia real:

- Los nombres y la fecha.
- Las iniciales, nombres y fecha (Valeria y la fecha actual son ejemplos).
- La foto de portada (`heroImage`).
- Las dos fotos del revelado (`reveal.image` y `reveal.secondImage`).
- Ocho recuerdos con título, texto y dos fotografías cada uno (`moments`).
- Las pequeñas cosas favoritas y la carta del futuro.
- La última foto, el mensaje de cumpleaños y el deseo (`birthday`).

Para usar sus fotografías, créales una carpeta `public/fotos` y escribe rutas como `/fotos/nuestra-primera-cita.jpg` en lugar de las URLs actuales. Las imágenes de ejemplo vienen de Unsplash únicamente para que el diseño se vea terminado desde el primer vistazo.

Para el revelado, dos fotografías del mismo encuadre hacen más convincente el efecto. Preferir imágenes horizontales de 1600–2400 px para portada, revelado y cierre. La galería acepta fotos verticales y horizontales; al abrirlas se muestran completas, sin recorte. Puedes añadir o quitar entradas en `moments`: el recorrido se ajusta a su longitud.

## Recorrido e interacciones

1. Portada original y navegación fija por capítulos.
2. Foto a pantalla completa: el cursor descubre una segunda imagen dentro de una máscara. El botón permite verla completa y volver a la primera (también funciona con toque o teclado).
3. Al bajar, el encuadre se reduce y aparece una declaración sobre fondo oscuro; el texto se ilumina con el scroll.
4. Collage horizontal sincronizado con el scroll vertical. El fondo pasa de oscuro a claro. Al pasar por una foto aparece la segunda; al pulsarla se abre el recuerdo.
5. Visor con anterior/siguiente, segunda foto y cierre con Escape. Flechas izquierda/derecha para navegar.
6. Dos capítulos fotográficos abren las pequeñas cosas y la carta del futuro.
7. La última fotografía se expande hasta llenar la pantalla con las felicitaciones. «Pide un deseo» muestra un mensaje y confeti; «Volver a vivirlo» regresa al inicio.

En pantallas menores de 900 px la galería usa una cuadrícula vertical. Se respeta la preferencia del sistema de reducir movimiento: se eliminan los tramos fijados, el parallax y el confeti; todo el contenido sigue accesible.

## Verificación y publicación

```powershell
npm run build
npm run preview
```

Fotos y tipografías de ejemplo requieren conexión a Internet. Las fotos definitivas pueden servirse desde `public/fotos`.

La web no necesita base de datos: `dist/` contiene la versión estática. Para publicar en una subcarpeta (por ejemplo GitHub Pages), configura el `base` de Vite y las rutas de las fotos para ese destino. No se ha publicado automáticamente.
