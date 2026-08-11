# WorldCupFan ⚽

Aplicación móvil (Android) para seguir a tus jugadores favoritos del Mundial. Permite registrar jugadores por selección, con un **filtro de comentarios por IA** que bloquea las reseñas negativas, estadísticas y un **mapa** con los países que más usan la app.

Proyecto individual — *Taller de Desarrollo Mobile y GenAI*, Analista en TI (Universidad ORT).

---

## 📱 Demo

- **APK (Android):** [`app-debug.apk`](./app-debug.apk) — descargá e instalá en tu teléfono.
- **Demo web:** _(pendiente — se agrega si la API de la cátedra está online)_

> Para instalar el APK: descargalo en el teléfono y habilitá "Instalar apps de orígenes desconocidos" para el navegador o gestor de archivos.

---

## ✨ Funcionalidades

- **Registro e inicio de sesión** con autenticación por token (JWT).
- **Sesión persistente:** el token se guarda en `localStorage` y la sesión sigue activa al reabrir la app.
- **Alta de jugadores** con selección, posición, fecha de nacimiento y comentario.
- **Análisis de sentimiento con IA (GenAI):** antes de registrar un jugador, el comentario se analiza y **se rechaza el alta si el sentimiento es negativo**.
- **Listado de jugadores** propios, con filtro por selección y eliminación deslizando el ítem.
- **Estadísticas:** selección favorita (la que tiene más jugadores) y mayoría de arqueros vs. jugadores de campo.
- **Mapa interactivo** (Leaflet + OpenStreetMap) con los 10 países con más usuarios.
- **Manejo de sesión vencida:** si el token expira, la app redirige al login.
- **Validaciones del lado del cliente** (la API no valida datos: se controlan antes de cada llamada).

---

## 🛠️ Tecnologías

- **Ionic** (Web Components vía CDN)
- **JavaScript** (vanilla, sin framework)
- **Leaflet** — mapas sobre OpenStreetMap
- **API REST** con autenticación **JWT**
- **Ionicons**

---

## ▶️ Cómo correrlo localmente

La app es un sitio estático (Ionic se carga por CDN, sin paso de build):

1. Cloná el repositorio.
2. Serví la carpeta `www/` con un servidor local (no abras `index.html` con doble clic: el ruteo y las llamadas a la API necesitan un servidor). Opciones:
   - Extensión **Live Server** de VS Code, o
   - `python -m http.server` dentro de `www/`.
3. Abrí la URL local que te indique el servidor.

> La app consume una API REST de la cátedra. Si la API no está disponible, el registro, login y demás funciones no responderán.

---

## 📂 Estructura

```
www/
├── index.html        # Estructura y pantallas (Ionic)
├── css/estilos.css   # Estilos propios
└── js/codigo.js      # Lógica: navegación, API, validaciones, mapa y estadísticas
```

---

## 👤 Autor

**Matías Tournier** — Estudiante de Analista en TI (Universidad ORT)
[LinkedIn](https://www.linkedin.com/in/matias-tournier) · [Portfolio](https://mtournier.github.io)
