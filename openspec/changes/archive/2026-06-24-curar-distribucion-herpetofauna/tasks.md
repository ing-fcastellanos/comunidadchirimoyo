## 1. Revisión de rangos (autor)

- [x] 1.1 Revisar las 8 listas ISO propuestas en `design.md` (Decisión 2) y ajustar según conocimiento de campo; confirmar o descartar `HN` en `tlalocohyla-picta`.
- [x] 1.2 Confirmar el trato de las 4 fichas al fallback (endémicas + introducida), sin `distribucion`.

## 2. Curar fichas de rango multi-país

- [x] 2.1 `content/fauna/anfibios/incilius-valliceps/index.md`: añadir `distribucion.residente: [MX, BZ, GT, HN, SV, NI, CR]` + `notas`.
- [x] 2.2 `content/fauna/anfibios/rhinella-horribilis/index.md`: `residente: [US, MX, BZ, GT, SV, HN, NI, CR, PA, CO, VE, EC, PE]` + `notas` (rango W de los Andes; introducida fuera de América = no se pinta).
- [x] 2.3 `content/fauna/anfibios/smilisca-baudinii/index.md`: `residente: [US, MX, BZ, GT, SV, HN, NI, CR]` + `notas`.
- [x] 2.4 `content/fauna/anfibios/lithobates-berlandieri/index.md`: `residente: [US, MX]` + `notas` (poblaciones del SW de EE.UU. introducidas).
- [x] 2.5 `content/fauna/anfibios/tlalocohyla-picta/index.md`: `residente: [MX, GT, BZ]` (+ HN si el autor lo confirma) + `notas`.
- [x] 2.6 `content/fauna/reptiles/sceloporus-grammicus/index.md`: `residente: [US, MX]` + `notas`.
- [x] 2.7 `content/fauna/reptiles/thamnophis-proximus/index.md`: `residente: [US, MX, BZ, GT, SV, HN, NI, CR]` + `notas`.
- [x] 2.8 `content/fauna/reptiles/trachemys-venusta/index.md`: `residente: [MX, BZ, GT, HN, SV, NI, CR, PA, CO]` + `notas`.

## 3. Confirmar fichas al fallback (sin cambios de datos)

- [x] 3.1 Verificar que `bolitoglossa-platydactyla`, `rheohyla-miotympanum`, `eleutherodactylus-cystignathoides` e `iguana-iguana` NO declaran `distribucion` (quedan en el fallback honesto).

## 4. Verificación

- [x] 4.1 `npm run validate:fichas` pasa (los códigos ISO no rompen el esquema; `distribucion` es opcional).
- [x] 4.2 `npm run build` verde.
- [x] 4.3 Preview: abrir una herp curada (p. ej. `trachemys-venusta`) y confirmar la **variante residente** — zona teal única, leyenda "Residente", países pintados; abrir una endémica (`bolitoglossa-platydactyla`) y confirmar el **fallback** (marcador local + "Residente", sin rango pintado).
- [x] 4.4 Verificar que los códigos ISO usados existen en el asset base (`regions[code]` de Natural Earth) — no quedan zonas declaradas sin pintar.
