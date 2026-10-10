// Lee recetas/*.json, valida el esquema básico y genera datos.js
// (un .js en vez de fetch() para que index.html funcione abriéndolo con doble clic).
// Uso: node build.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
const dir = join(raiz, 'recetas');
// Solo sistema métrico (sólidos en g, líquidos en ml) más medidas de casa sin equivalente.
// Nada de cucharadas, tazas, onzas ni vasos: se convierten al dar de alta.
const UNIDADES = ['g', 'kg', 'ml', 'cl', 'l', 'loncha', 'diente', 'pizca', 'hoja', 'ramita', 'manojo', 'lata', 'sobre', 'chorro', 'chorrito', 'pastilla', 'tenedor'];

const ESTILOS = ['clasico', 'trattoria', 'mediterraneo', 'bistro', 'nordico', 'huerta', 'libro-rosa', 'revista'];

const errores = [];
const recetas = readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => {
    const r = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const err = m => errores.push(`${f}: ${m}`);
    if (r.id + '.json' !== f) err(`id "${r.id}" no coincide con el nombre de fichero`);
    for (const k of ['titulo', 'raciones', 'ingredientes', 'pasos']) if (!r[k]) err(`falta "${k}"`);
    if (r.estilo && !ESTILOS.includes(r.estilo)) err(`estilo desconocido "${r.estilo}"`);
    for (const g of r.ingredientes ?? [])
      for (const i of g.items ?? []) {
        if (!i.nombre) err(`ingrediente sin nombre en "${g.grupo}"`);
        if (i.unidad && !UNIDADES.includes(i.unidad)) err(`unidad desconocida "${i.unidad}" (${i.nombre})`);
        if (i.cantidad != null && typeof i.cantidad !== 'number') err(`cantidad no numérica (${i.nombre})`);
      }
    return r;
  })
  .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));

// Grupos que remiten a otra receta ({ "grupo": …, "de": { "receta": id, "grupo": nombre } }):
// se copian sus ingredientes, ajustados a las raciones de esta receta.
for (const r of recetas)
  for (const g of r.ingredientes ?? []) {
    if (!g.de) continue;
    const src = recetas.find(x => x.id === g.de.receta);
    const sg = src?.ingredientes.find(x => x.grupo === g.de.grupo);
    if (!sg || sg.de) { errores.push(`${r.id}: no encuentro el grupo "${g.de.grupo}" en "${g.de.receta}"`); continue; }
    const f = r.raciones.cantidad / src.raciones.cantidad;
    g.items = sg.items.map(i => ({ ...i, ...(i.cantidad != null && i.escala !== false && { cantidad: i.cantidad * f }) }));
    g.de.titulo = src.titulo;
  }

if (errores.length) {
  console.error(errores.join('\n'));
  process.exit(1);
}
writeFileSync(join(raiz, 'datos.js'),
  `// Generado por build.mjs — no editar a mano\nwindow.RECETAS = ${JSON.stringify(recetas, null, 1)};\n`);
console.log(`datos.js: ${recetas.length} receta(s)`);
