# Control Electoral · Ionic Angular (standalone) + Capacitor

## Ejecutar
```
npm install
npm start                 # navegador (http://localhost:4200)
npm run build && npx cap sync android && npx cap open android   # Android Studio
```

## Modo demostración
La app corre completa con una **capa de datos simulada** (`src/app/core/data/demo-db.service.ts`) que reemplaza a Supabase/Cloudinary:
datos en `localStorage`, latencia de red simulada y **reglas de acceso por rol y pertenencia aplicadas en esa capa** (no solo ocultando pantallas).
Para conectar Supabase se reemplaza únicamente ese servicio (`SupabaseService` ya está en `core/services`); las pantallas no cambian.
Pendiente a futuro: Supabase (RLS reales, Edge Function para crear cuentas), Cloudinary (subida de fotos), login por cédula→correo.

## Usuarios demo (clave inicial `Ecuador2026`)
Se autocompletan tocando los chips en la pantalla de login: Coordinador provincial, Coordinador de recinto (Colegio Mejía), Veedor de mesa.
Las cuentas nuevas creadas desde la app obligan a cambiar la clave en el primer acceso.

## Cobertura de requisitos
| Req | Dónde |
|---|---|
| R1 | Semilla: Pichincha/Quito, 5 parroquias, 5 recintos (3–6 JRV), 5 organizaciones, 5 candidatos alcalde y 5 prefecto |
| R2 | Provincial crea recinto + coordinador (mesas automáticas); coordinador crea veedores; cédula validada (módulo 10); aviso de confirmación por correo |
| R3 | Login por cédula, clave inicial, cambio obligatorio, recuperación; credenciales fuera de la UI |
| R4 | Pestañas Recintos y Resultados (votos por candidato, consolidado o por recinto, avance %, GPS con enlace a mapa) |
| R5 | Pestaña Mesas: estados, asignar/reasignar veedor, crear veedores, corregir actas y fotos |
| R6 | Mis mesas + formulario de acta con validación de totales (no guarda si no cuadra) |
| R7 | `DispositivoService`: Capacitor Camera/Geolocation, permisos y errores, control de nitidez (varianza del laplaciano) |
| R8 | Perfil > "Probar acceso a mesa ajena": la capa de datos responde 403 |
| R9 | Capas: páginas → servicios de feature → capa de datos; estado con **signals** (nativo de Angular, sin librerías extra); estados cargando/ok/error/validación |
| R10 | Cola local + sincronización automática al volver la conexión (interruptor "Simular sin conexión"). Conflictos: gana el servidor si fue modificado después de encolar el registro |
