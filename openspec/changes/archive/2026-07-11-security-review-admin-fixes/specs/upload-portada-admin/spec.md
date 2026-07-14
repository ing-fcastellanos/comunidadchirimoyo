## MODIFIED Requirements

### Requirement: Validación del archivo antes de subir

El endpoint SHALL validar el archivo antes de subirlo: `content-type` restringido a `image/jpeg`, `image/png` o `image/webp`, tamaño máximo de 5MB, y la **firma binaria real** (magic bytes) del archivo SHALL coincidir con el `content-type` declarado (`89 50 4E 47` para PNG, `FF D8 FF` para JPEG, `"RIFF"`+`"WEBP"` en los offsets correspondientes para WebP) — el `content-type` que declara el cliente es falsificable y NO SHALL ser la única verificación. Un archivo que no cumpla cualquiera de estas validaciones SHALL rechazarse sin subir nada al bucket. El sistema NO SHALL re-optimizar, re-codificar ni redimensionar el archivo — se guarda tal cual se recibió.

#### Scenario: Tipo de archivo no soportado
- **WHEN** se envía un archivo cuyo `content-type` no es `image/jpeg`, `image/png` ni `image/webp`
- **THEN** la subida se rechaza con un error de validación, sin escribir nada en el bucket

#### Scenario: Archivo demasiado grande
- **WHEN** se envía un archivo de más de 5MB
- **THEN** la subida se rechaza con un error de validación, sin escribir nada en el bucket

#### Scenario: Firma binaria no coincide con el content-type declarado
- **WHEN** se envía un archivo cuyo `content-type` declarado es `image/png` (u otro de los soportados) pero cuyos primeros bytes no corresponden a la firma real de ese formato
- **THEN** la subida se rechaza con un error de validación, sin escribir nada en el bucket
