# Checklist antes de publicar holyburgerirun.com

## 1. Subir todos los archivos
Asegúrate de que el hosting tiene la carpeta completa, con esta estructura exacta:

```
/index.html
/styles.css
/script.js
/manifest.json
/robots.txt
/sitemap.xml
/404.html
/img/            (todas las fotos, incluidos los -thumb.jpg)
/video/
/fr/index.html   (la versión en francés)
```

Si falta `styles.css`, `script.js` o la carpeta `fr/`, la web se ve rota o a medias. Súbelo todo junto, no solo `index.html`.

## 2. Dominio y HTTPS
- Confirma que `holyburgerirun.com` apunta al hosting (DNS propagado).
- Confirma que el candado HTTPS funciona (sin él, Google penaliza el posicionamiento y el navegador avisa de "no seguro").
- Prueba también `www.holyburgerirun.com` por si alguien lo escribe así, para que redirija al dominio principal.

## 3. Probar en real, no solo en local
- Abre `https://holyburgerirun.com/` y `https://holyburgerirun.com/fr/` desde el móvil y desde el ordenador.
- Prueba el botón "FR"/"ES" del menú.
- Prueba el botón flotante "Cómo llegar" y el de compartir en un móvil.
- Haz scroll hasta el final y comprueba que el aviso de cookies aparece y que "Aceptar" lo cierra bien.
- Abre una foto cualquiera y comprueba que el lightbox amplía correctamente.
- Dale a Ctrl+P (o "Guardar como PDF") y comprueba que solo sale la carta limpia.

## 4. Google Search Console
- Da de alta la propiedad `holyburgerirun.com` en [Google Search Console](https://search.google.com/search-console).
- Envía el sitemap: `https://holyburgerirun.com/sitemap.xml`.
- Con esto, Google empieza a rastrear la web y las dos versiones de idioma correctamente.

## 5. Google Analytics (cuando lo tengas listo)
1. Crea la propiedad en [analytics.google.com](https://analytics.google.com) → Administrar → Crear propiedad.
2. Copia el Measurement ID (formato `G-XXXXXXXXXX`).
3. Abre `index.html`, busca el bloque comentado `GOOGLE ANALYTICS (GA4)` cerca del principio del archivo.
4. Sustituye las dos apariciones de `G-XXXXXXXXXX` por tu ID real.
5. Quita las marcas de comentario (`<!--` y `-->`) que envuelven ese bloque de scripts.
6. Repite lo mismo en `fr/index.html`.

En cuanto lo actives, ya vas a ver en Analytics cuántas veces se pulsa "Cómo llegar", "Ver carta", "Instagram", etc. (ya están cableados esos eventos, solo faltaba el ID).

## 6. Redes y perfiles
- Comprueba que el enlace de Instagram y el de "Ver en Google Business" abren donde deben.
- Si en algún momento activáis Glovo, Uber Eats o similar, avísame y os añado los botones.

## 7. Últimos detalles opcionales
- El código QR (`qr-holy-burger.png`) ya apunta a `https://holyburgerirun.com/`, listo para imprimir.
- Si cambiáis algún precio o plato de la carta, decídmelo y actualizo también el bloque de datos estructurados (para que Google lo muestre bien en el buscador), no solo el texto visible.

---
Cualquier cosa que veas rara una vez esté en real, mándame captura y lo reviso.
