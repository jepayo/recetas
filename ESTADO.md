# Recetario

Catálogo personal de recetas en un formato estándar (JSON), con visor HTML.

## Estructura
- `recetas/<id>.json` — **la base de datos**: un fichero por receta. Es la fuente de verdad.
- `build.mjs` — valida las recetas y genera `datos.js`. Ejecutar `node build.mjs` tras cada alta o cambio.
- `datos.js` — generado, no editar. Existe para que `index.html` funcione abriéndolo con doble clic (sin servidor).
- `index.html` — visor: índice con búsqueda/filtros (`#/`) y ficha de receta (`#/r/<id>`, opcional `/<raciones>`).

## Convenciones de alta
- Todo se traduce al **español**. El `titulo` se puede dejar en el idioma original cuando le da carácter (p. ej. italiano); entonces `titulo_es` lleva la traducción.
- `id` = slug del título, igual al nombre del fichero.
- Recetas manuscritas: primero transcripción literal (con dudas marcadas [?]) que el usuario revisa; se guarda en `original`. Luego la versión adaptada/expandida es la receta; los cambios de fondo van en `nota_adaptacion`.
- Si el original tiene una errata o algo ambiguo, se corrige en el texto y se deja `nota_traduccion` en el paso.
- **Solo sistema métrico:** sólidos en gramos, líquidos en ml/l. Nada de cucharadas, cucharaditas, tazas, onzas, pulgadas ni °F: se convierten al dar de alta (cucharada = 15 ml, cucharadita = 5 ml; sal ≈ 6 g por cucharadita, miel ≈ 7 g). `build.mjs` rechaza esas unidades. Las medidas de casa sin equivalente (tenedor, chorro, pizca, diente, loncha…) se mantienen.

## Esquema
```jsonc
{
  "id": "slug", "titulo": "…", "titulo_es": "…", "idioma_original": "it",
  "fuente": { "tipo": "libro|web|familia", "nombre": null, "autor": null, "pagina": null, "nota": "…" },
  "cocina": "italiana", "categoria": "Entrantes", "etiquetas": ["…"],
  "estilo": "trattoria",                                          // opcional; por defecto "clasico"
  "raciones": { "cantidad": 4, "unidad": "personas", "original": "Per 4 amici" },
  "tiempos": { "preparacion": 25, "reposo": 20, "coccion": 40 },   // minutos
  "ingredientes": [ { "grupo": "Para la bechamel", "items": [
      { "cantidad": 40, "unidad": "g", "nombre": "mantequilla", "nota": "…" },
      { "cantidad": 2, "nombre": "huevo", "nombre_plural": "huevos" },        // sin unidad = contable
      { "cantidad": 2, "unidad": "l", "nombre": "aceite", "escala": false },   // no cambia al escalar
      { "cantidad": 400, "unidad": "g", "nombre": "tallarines", "estimada": true } // el original no la da → «≈»
  ]}],
  // un grupo puede remitir a otra receta: copia sus ingredientes ajustados a las raciones y enlaza
  // { "grupo": "Para la salsa", "de": { "receta": "ensalada-de-canonigos", "grupo": "Para la salsa" } }
  "pasos": [ { "titulo": "opcional", "texto": "…", "nota_traduccion": "opcional", "nota_adaptacion": "opcional" } ],
  "notas": [ { "titulo": "Conviene saber", "texto": "…" } ],
  "original": { "tipo": "manuscrito", "texto": "transcripción literal", "dudas": ["pendientes"], "aclaraciones": ["resueltas con el usuario"] },  // opcional, se ve plegado en la ficha
  "alta": "AAAA-MM-DD"
}
```
Unidades válidas: `g kg ml cl l loncha diente pizca hoja ramita manojo lata sobre chorro chorrito pastilla tenedor rebanada rama cabeza puñado` (ampliar en `build.mjs` y en `NOMBRES` de `index.html`). Sin `cantidad` = "al gusto".

## Estilos
Cada receta puede llevar `estilo`, que cambia colores, tipografías, fondo y adornos de su ficha y de su tarjeta en el índice. El índice en sí usa siempre el clásico (y respeta el modo oscuro).
- `clasico` — papel cálido y terracota (por defecto).
- `trattoria` — trattoria italiana: blanco, orlas de pinceladas rojas, tira de cuadros rojos y blancos, títulos en mayúsculas, «• ● •» y notas sobre fondo azul liso.
- `mediterraneo` — cobalto y amarillo de azulejo.
- `bistro` — oscuro y dorado.
- `nordico` — blanco y negro, minimalista.
- `huerta` — verde oliva y paja.
- `libro-rosa-cuadros` — spin-off del libro rosa para sus hojas cuadriculadas: mismo rosa, tipografías y tinta, pero papel blanco con cuadrícula azul en vez de naranja.
- `revista` — editorial de revista (tipo Telva): titular enorme y fino (Jost) a la izquierda, blanco y negro, acento ocre, pasos 01, 02…
- `libro-rosa` — el cuaderno familiar: tapa rosa, hoja naranja, títulos a mano (Caveat) subrayados y tinta de boli.

El selector «Estilo» de la ficha es solo una vista previa: lo que se guarda es lo que diga el JSON. Para añadir un estilo nuevo: un bloque `[data-estilo]` en el CSS de `index.html`, y su entrada en `ESTILOS`, tanto en `index.html` como en `build.mjs`.

## Escalado
Raciones con − / + (de uno en uno, mínimo ½) o atajos ½ / original / doble. Pesos y volúmenes se redondean "de báscula", las piezas y medidas de casa a fracciones (¼ ⅓ ½ ⅔ ¾). Tiempos y temperaturas de los pasos no se escalan.

## Recetas
| id | fuente | alta |
|---|---|---|
| crocchette-guanciale-e-tartufo | libro italiano | 2026-10-10 |
| risotto-al-tartufo | libro italiano | 2026-10-10 |
| tallarines-con-almejas | libro rosa (manuscrito familiar) | 2026-10-10 |
| ensalada-de-canonigos | libro rosa (manuscrito familiar) | 2026-10-10 |
| ensalada-gourmet | libro rosa (manuscrito familiar) | 2026-10-10 |
| tabla-de-quesos-y-cia | revista Telva (recorte) | 2026-10-10 |
| risotto-peramore | libro italiano | 2026-10-10 |
| tomates-confitados | libro italiano | 2026-10-10 |
| mozza-fritta | libro italiano | 2026-10-10 |
| zuppa-di-vino | libro italiano | 2026-10-10 |
| big-lasagna | libro italiano | 2026-10-10 |
| la-gran-carbonara | libro italiano | 2026-10-10 |
| salsa-cacio-e-pepe | libro italiano | 2026-10-10 |
| potaje-de-garbanzos | libro rosa, hojas de cuadros | 2026-10-10 |
| canelones-de-la-abuela | libro rosa | 2026-10-10 |
| canelones-de-verano | libro rosa | 2026-10-10 |
| monteritas-de-mejillones | libro rosa | 2026-10-10 |
| cordero-asado | libro rosa | 2026-10-10 |
