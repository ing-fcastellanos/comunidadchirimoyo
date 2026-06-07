# ADR-0007 — Donaciones informativas (sin pasarela de pago)

- **Estado:** Accepted
- **Fecha:** 2026-06-07
- **Decisores:** @ing-fcastellanos
- **Issue:** _kickoff_

## Contexto

`voluntarios.chirimoyo.org` invita a apoyar económicamente (transferencias **Spin/OXXO**) o en especie. Hay que decidir si se integra una pasarela de pago o solo se informa cómo donar.

Las transferencias Spin entre personas no exponen una API de cobro; una pasarela formal (tarjeta) implicaría comisiones, KYC y obligaciones fiscales/legales que un grupo vecinal no necesariamente quiere asumir hoy.

## Decisión

Las donaciones son **informativas**: la página muestra los datos para transferencia Spin/OXXO (teléfono/CLABE), un QR si aplica, y cómo donar en especie. **Sin integración de pago en línea.**

## Alternativas consideradas

- **Con registro de donación:** además de informar, un formulario donde quien dona avisa monto/comprobante para llevar registro y agradecer. Útil, pero añade backend y manejo de comprobantes; se difiere como mejora opcional.
- **Pasarela de pago real (MercadoPago/Stripe):** donar con tarjeta en línea. Máximo alcance, pero comisiones, KYC, conciliación y trabajo de integración desproporcionados para la etapa actual.

## Consecuencias

### Positivas

- Cero comisiones, cero KYC, cero obligaciones de procesador.
- Implementación trivial (contenido estático).

### Negativas

- Fricción para el donante (debe hacer la transferencia manualmente).
- Sin registro automático de donaciones; el seguimiento es manual.

### Neutras

- Los datos de transferencia viven en `content/` y se actualizan vía git.

## Plan de revisión

Reconsiderar (registro de donación o pasarela) si el volumen de donaciones crece y el seguimiento manual deja de ser viable, o si se formaliza una figura legal que facilite KYC.

## Referencias

- ADR-0006 (API mínima), ROADMAP Fase 4.
