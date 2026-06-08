# infra/holding

Página **temporal** "muy pronto" para `chirimoyo.org` (apex + www), servida por el site de Firebase `chirimoyo` (`chirimoyo.web.app`).

Es un placeholder estático on-brand mientras se construye `apps/sitio` (#5). **Se reemplaza** cuando `sitio` esté listo: en #5 se re-apunta el apex a la app real y se elimina esta carpeta.

## Desplegar

```bash
cd infra/holding
firebase deploy --only hosting --project chirimoyo
```

(Despliega al site `chirimoyo`, distinto del site `aves-chirimoyo` del catálogo.)
