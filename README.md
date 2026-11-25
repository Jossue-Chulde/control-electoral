# Control Electoral - Aplicación Móvil
Aplicación móvil desarrollada para la gestión, registro y supervisión del escrutinio electoral de una organización política en Ecuador. Permite a coordinadores y veedores registrar actas desde las Juntas Receptoras del Voto (JRV) con evidencia fotográfica y geolocalización.

## Tecnologías Utilizadas
Framework: Ionic 8 + Angular (Standalone Components)

Lenguaje: TypeScript

Backend as a Service (BaaS): Supabase (Auth, PostgreSQL, Row Level Security)

Almacenamiento de Imágenes: Cloudinary

Empaquetado Móvil: Capacitor (Android)

## 1. Instalación y Ejecución
Sigue estos pasos para levantar el proyecto en tu entorno local:

Clonar el repositorio:

```bash
git clone https://github.com/Jossue-Chulde/control-electoral
cd control-electoral
```
Instalar dependencias:
```bash
npm install
```

Ejecutar en el navegador (Modo Desarrollo):
```bash
ionic serve
```
Compilar para Android:
```bash
ionic build
npx cap add android
npx cap sync android
npx cap open android
```

## 2. Configuración del Entorno
El proyecto requiere variables de entorno para conectarse a los servicios en la nube.

Dirígete a la carpeta src/environments/.

Abre el archivo environment.ts (y environment.prod.ts) y asegúrate de que contenga las credenciales de tu proyecto de Supabase:
```bash
export const environment = {
  production: false,
  supabaseUrl: 'https://iyyenoqbgmjjdgrgbfbf.supabase.co',
  supabaseKey: 'sb_publishable_eisFqLf8IVM41UOk9thJOA_5Hb49fG6'
};
```
## 3. Arquitectura del Proyecto
El frontend está construido con una arquitectura modular orientada a características (Feature-based) para mantener el código limpio y escalable:
```bash
src/
└── app/
    ├── core/               # Lógica transversal (Servicios globales)
    │   └── services/       # AuthService, SupabaseService
    ├── shared/             # Elementos reutilizables
    │   ├── models/         # Interfaces (Usuario, etc.)
    │   └── validators/     # Validadores (Cédula, etc.)
    ├── features/           # Módulos de la aplicación
    │   ├── auth/           # Login y manejo de sesión
    │   ├── tabs/           # Navegación principal (Tabs dinámicos por rol)
    │   ├── recintos/       # Gestión de recintos (Rol Provincial)
    │   ├── mesas/          # Asignación y gestión (Rol Coordinador)
    │   ├── actas/          # Registro de votos, cámara y GPS (Rol Veedor)
    │   └── resultados/     # Dashboard y estadísticas
    ├── app.routes.ts       # Enrutamiento principal (Lazy Loading)
    └── app.config.ts       # Configuración de providers
```


## 4. Modelo de Datos y Seguridad (Supabase)
La base de datos PostgreSQL en Supabase está estructurada bajo las siguientes entidades principales:

Geografía: provincias, cantones, parroquias.

Usuarios: perfiles (vinculada a auth.users, contiene el rol y estado de la cuenta).

Catálogos: organizaciones, candidaturas.

Operación: recintos, mesas, actas, acta_votos, acta_ediciones.


## Seguridad (Row Level Security - RLS)
La aplicación no oculta pantallas para simular seguridad; la seguridad real está a nivel de base de datos. Se aplicaron políticas RLS estrictas:

Coordinador Provincial: Puede leer todos los datos de su jurisdicción.

Coordinador de Recinto: Solo puede ver y modificar información vinculada a su recinto_id.

Veedor: Solo puede leer sus mesas asignadas e insertar actas en ellas. (Un veedor no puede ver actas de mesas que no le pertenecen).

Demostración de seguridad: Se comprobó mediante peticiones directas que el token JWT de un veedor no permite leer la tabla mesas si no tiene el veedor_id correspondiente.

## 5. Pruebas y Validaciones Implementadas

Durante el desarrollo se aplicaron las siguientes reglas de negocio y pruebas:

Validación de Acta: El sistema bloquea el guardado de un acta si la suma de votos de las 5 organizaciones + votos nulos + votos blancos no es igual al total de sufragantes.

Cámara y GPS: Se captura la foto del acta y se obtienen las coordenadas GPS en el momento del registro. Si el GPS falla, se permite el guardado pero se registra una advertencia.

Cédula Ecuatoriana: El registro de usuarios valida que la cédula cumpla con el algoritmo del módulo 10.

Evidencia de Bloqueo (RLS): Se realizaron pruebas en la consola de red (F12) demostrando que un usuario con rol no autorizado recibe un error 403 Forbidden o una lista vacía al intentar consultar datos ajenos.






