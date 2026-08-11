// Obligatorio - Taller de Desarrollo Mobile y GenAi - Matias Tournier - 262646

// ============================== CONSTANTES ==============================
const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const HOME_DESLOGUEADO = document.querySelector("#home-deslogueado");
const HOME_LOGUEADO = document.querySelector("#home-logueado");
const REGISTRO = document.querySelector("#pantalla-registro");
const LOGIN = document.querySelector("#pantalla-login");
const AGREGAR = document.querySelector("#pantalla-agregarJugador");
const LISTADO = document.querySelector("#pantalla-listadoJugadores");
const MAPA = document.querySelector("#pantalla-mapaUsuarios");
const NAV = document.querySelector("ion-nav");
const URLBASE = "https://worldcupfan.develotion.com";

// ============================== INICIO Y EVENTOS ==============================
Inicio();

function Inicio() {
    ArmarMenu();
    Eventos();
}

function Eventos() {
    ROUTER.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnRegistrar").addEventListener('click', TomarDatosRegistro);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
    document.querySelector("#btnCerrarSesionHome").addEventListener('click', CerrarSesion);
    document.querySelector("#btnAgregarJugador").addEventListener('click', TomarDatosAgregarJugador);
    document.querySelector("#slcFiltro").addEventListener('ionChange', MostrarJugadores);
}

// ============================== NAVEGACIÓN Y MENÚ ==============================
function Navegar(evt) {
    OcultarPantallas();

    let ruta = evt.detail.to;
    ResaltarMenu(ruta);

    if (ruta == "/") {
        HOME.style.display = "block";
        ActualizarHome();
    } else if (ruta == "/registro") {
        PoblarSelectPaises();
        REGISTRO.style.display = "block";
    } else if (ruta == "/login") {
        LOGIN.style.display = "block";
    } else if (ruta == "/agregarJugador") {
        PoblarSelectSelecciones();
        PoblarSelectPosiciones();
        // la fecha de nacimiento debe ser anterior a hoy, limitamos el calendario
        document.querySelector("#datetime").max = new Date().toISOString().slice(0, 10);
        AGREGAR.style.display = "block";
    } else if (ruta == "/listadoJugadores") {
        LISTADO.style.display = "block";
        CargarListadoJugadores();
    } else if (ruta == "/mapaUsuarios") {
        MAPA.style.display = "block";
        CargarMapa();
    } else {
        console.log("Ruta no reconocida:", ruta);
    }

    MENU.close();
}

function OcultarPantallas() {
    HOME.style.display = "none";
    REGISTRO.style.display = "none";
    LOGIN.style.display = "none";
    AGREGAR.style.display = "none";
    LISTADO.style.display = "none";
    MAPA.style.display = "none";
}

function ArmarMenu() {
    let hayToken = localStorage.getItem("token");

    let html = `<ion-item href="/">Home</ion-item>`;
    if (hayToken) {
        html += `<ion-item href="/agregarJugador">Agregar Jugador</ion-item>
                 <ion-item href="/listadoJugadores">Listado de Jugadores</ion-item>
                 <ion-item href="/mapaUsuarios">Mapa de Usuarios</ion-item>
                 <ion-item onclick="CerrarSesion()">Cerrar Sesión</ion-item>`;
    } else {
        html += `<ion-item href="/registro">Registro</ion-item>
                 <ion-item href="/login">Login</ion-item>`;
    }

    document.querySelector("#menuOpciones").innerHTML = html;
}

function ResaltarMenu(ruta) {
    let items = document.querySelectorAll("#menuOpciones ion-item");
    for (let item of items) {
        if (item.getAttribute("href") == ruta) {
            item.classList.add("item-activo");
        } else {
            item.classList.remove("item-activo");
        }
    }
}

// ============================== HOME ==============================
function ActualizarHome() {
    let hayToken = localStorage.getItem("token");
    if (hayToken) {
        HOME_DESLOGUEADO.style.display = "none";
        HOME_LOGUEADO.style.display = "block";
    } else {
        HOME_DESLOGUEADO.style.display = "block";
        HOME_LOGUEADO.style.display = "none";
    }
}

// ============================== REGISTRO / LOGIN / SESIÓN ==============================
async function PoblarSelectPaises() {
    try {
        PrenderLoader("Cargando países...");
        let response = await fetch(`${URLBASE}/paises`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw response;
        }

        let data = await response.json();
        let html = ``;
        for (let p of data.paises) {
            html += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
        }
        document.querySelector("#slcPais").innerHTML = html;

    } catch (error) {
        ManejarError(error);
    } finally {
        ApagarLoader();
    }
}

async function TomarDatosRegistro() {
    let usuario = document.querySelector("#txtRegistroUsuario").value;
    let password = document.querySelector("#txtRegistroPass").value;
    let pais = document.querySelector("#slcPais").value;

    if (DatosValidos([usuario, password, pais])) {
        try {
            let objReg = new Object();
            objReg.usuario = usuario;
            objReg.password = password;
            objReg.idPais = pais;

            PrenderLoader("Registrando usuario...");
            let response = await fetch(`${URLBASE}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(objReg)
            });

            let data = await response.json();

            if (!response.ok) {
                Alertar("IMPORTANTE", "Error en el registro", data.mensaje);
            } else {
                localStorage.setItem("token", data.token);
                ArmarMenu();
                NAV.push("page-home");
                MostrarToast("Usuario registrado correctamente", 2000);
            }
        } catch (error) {
            ManejarError(error);
        } finally {
            ApagarLoader();
        }
    }
}

async function TomarDatosLogin() {
    let usuario = document.querySelector("#txtLoginUsuario").value;
    let password = document.querySelector("#txtLoginPass").value;

    if (DatosValidos([usuario, password])) {
        try {
            let objReg = new Object();
            objReg.usuario = usuario;
            objReg.password = password;

            PrenderLoader("Iniciando sesión...");
            let response = await fetch(`${URLBASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(objReg)
            });

            if (response.ok) {
                let data = await response.json();
                localStorage.setItem("token", data.token);
                ArmarMenu();
                NAV.push("page-home");
                MostrarToast("Sesión iniciada", 2000);
            } else {
                Alertar("IMPORTANTE", "Error en el login", "Usuario o contraseña incorrectos");
            }
        } catch (error) {
            ManejarError(error);
        } finally {
            ApagarLoader();
        }
    }
}

function CerrarSesion() {
    localStorage.clear();
    ArmarMenu();
    ActualizarHome();
    NAV.push("page-home");
    MENU.close();
    MostrarToast("Sesión cerrada", 2000);
}

function MandarAlLogin() {
    localStorage.clear();
    ArmarMenu();
    NAV.push("page-login");
}

// ============================== AGREGAR JUGADOR ==============================
async function PoblarSelectSelecciones() {
    try {
        PrenderLoader("Cargando selecciones...");
        let selecciones = await ObtenerSelecciones();
        let html = ``;
        for (let s of selecciones) {
            html += `<ion-select-option value="${s.id}">${s.emoji} ${s.nombre}</ion-select-option>`;
        }
        document.querySelector("#slcSeleccion").innerHTML = html;
    } catch (error) {
        ManejarError(error);
    } finally {
        ApagarLoader();
    }
}

async function PoblarSelectPosiciones() {
    try {
        PrenderLoader("Cargando posiciones...");
        let posiciones = await ObtenerPosiciones();
        let html = ``;
        for (let p of posiciones) {
            html += `<ion-select-option value="${p.id}">${p.nombre}</ion-select-option>`;
        }
        document.querySelector("#slcPosicion").innerHTML = html;
    } catch (error) {
        ManejarError(error);
    } finally {
        ApagarLoader();
    }
}

async function TomarDatosAgregarJugador() {
    let idSeleccion = document.querySelector("#slcSeleccion").value;
    let nombre = document.querySelector("#txtNombreJugador").value;
    let posicion = document.querySelector("#slcPosicion").value;
    let fechaNacimiento = document.querySelector("#datetime").value;
    let comentario = document.querySelector("#txtComentario").value;

    // el datetime devuelve la fecha con la hora incluida, nos quedamos solo con AAAA-MM-DD
    if (fechaNacimiento != null) {
        fechaNacimiento = fechaNacimiento.slice(0, 10);
    }

    if (DatosValidos([idSeleccion, nombre, posicion, fechaNacimiento, comentario])) {

        // la fecha de nacimiento debe ser anterior a hoy
        let hoy = new Date().toISOString().slice(0, 10);
        if (fechaNacimiento >= hoy) {
            Alertar("IMPORTANTE", "Fecha inválida", "La fecha de nacimiento debe ser anterior a hoy");
            return;
        }

        try {
            PrenderLoader("Analizando comentario...");
            let sentimiento = await ObtenerSentimiento(comentario);
            ApagarLoader();

            // solo se permiten comentarios neutros o positivos, si es negativo no se da de alta
            if (sentimiento == "Negativo") {
                Alertar("IMPORTANTE", "Comentario negativo", "No se puede agregar un jugador con un comentario negativo");
                return;
            }

            PrenderLoader("Agregando jugador...");
            // el comentario NO se guarda
            let objJugador = new Object();
            objJugador.idSeleccion = idSeleccion;
            objJugador.nombre = nombre;
            objJugador.posicion = posicion;
            objJugador.fechaNacimiento = fechaNacimiento;

            let t = localStorage.getItem("token");
            let response = await fetch(`${URLBASE}/jugadores`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + t
                },
                body: JSON.stringify(objJugador)
            });

            if (!response.ok) {
                throw response;
            }

            MostrarToast("Jugador agregado correctamente", 2000);
            NAV.push("page-listadoJugadores");
        } catch (error) {
            ManejarError(error);
        } finally {
            ApagarLoader();
        }
    }
}

// ObtenerSelecciones y ObtenerPosiciones también las usa el listado
async function ObtenerSelecciones() {
    let t = localStorage.getItem("token");
    let response = await fetch(`${URLBASE}/selecciones`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + t
        },
    });

    if (!response.ok) {
        throw response;
    }

    let data = await response.json();
    return data.selecciones;
}

async function ObtenerPosiciones() {
    let t = localStorage.getItem("token");
    let response = await fetch(`${URLBASE}/posiciones`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + t
        },
    });

    if (!response.ok) {
        throw response;
    }

    let data = await response.json();
    return data.posiciones;
}

async function ObtenerSentimiento(comentario) {
    let t = localStorage.getItem("token");
    let response = await fetch(`${URLBASE}/genai`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + t
        },
        body: JSON.stringify({ prompt: comentario })
    });

    if (!response.ok) {
        throw response;
    }

    let data = await response.json();
    return data.sentiment;
}

// ============================== LISTADO DE JUGADORES ==============================
let listaJugadores = [];
let listaSelecciones = [];
let listaPosiciones = [];

async function CargarListadoJugadores() {
    try {
        PrenderLoader("Cargando listado de jugadores...");
        listaJugadores = await ObtenerJugadores();
        listaSelecciones = await ObtenerSelecciones();
        listaPosiciones = await ObtenerPosiciones();

        PoblarSelectFiltro();                                   // llena el filtro con las selecciones
        MostrarJugadores();                                     // arma la lista segun el filtro elegido
        CalcularEstadisticas(listaJugadores, listaSelecciones); // stats sobre TODOS los jugadores
    } catch (error) {
        ManejarError(error);
    } finally {
        ApagarLoader();
    }
}

function PoblarSelectFiltro() {
    let html = `<ion-select-option value="todas">Todas</ion-select-option>`;
    for (let s of listaSelecciones) {
        html += `<ion-select-option value="${s.id}">${s.emoji} ${s.nombre}</ion-select-option>`;
    }
    document.querySelector("#slcFiltro").innerHTML = html;
    document.querySelector("#slcFiltro").value = "todas"; // por defecto mostramos todas
}

function MostrarJugadores() {
    let filtro = document.querySelector("#slcFiltro").value;

    let html = `<ion-list>`;
    for (let j of listaJugadores) {

        // mostramos el jugador si el filtro es "todas" o si su seleccion coincide
        if (filtro == "todas" || j.idSeleccion == filtro) {

            let bandera = "";
            for (let s of listaSelecciones) {
                if (s.id == j.idSeleccion) {
                    bandera = s.emoji;
                }
            }

            let nombrePosicion = "";
            for (let p of listaPosiciones) {
                if (p.id == j.posicion) {
                    nombrePosicion = p.nombre;
                }
            }

            html += `<ion-item-sliding>
                    <ion-item>
                        <ion-label>
                            <h2>${bandera} ${j.nombre}</h2>
                            <p>${nombrePosicion}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item-options side="end">
                        <ion-item-option color="danger" onclick="EliminarJugador(${j.id})">Eliminar</ion-item-option>
                    </ion-item-options>
                  </ion-item-sliding>`;
        }
    }
    html += `</ion-list>`;
    document.querySelector("#listadoJugadores").innerHTML = html;
}

function CalcularEstadisticas(jugadores, selecciones) {
    // seleccion favorita = la seleccion con mas jugadores registrados
    let favorita = null;
    let maxCantidad = 0;
    for (let s of selecciones) {
        let cantidad = 0;
        for (let j of jugadores) {
            if (j.idSeleccion == s.id) {
                cantidad++;
            }
        }
        if (cantidad > maxCantidad) {
            maxCantidad = cantidad;
            favorita = s;
        }
    }

    let textoFavorita = "—";
    if (favorita != null) {
        textoFavorita = favorita.emoji + " " + favorita.nombre;
    }
    document.querySelector("#statSeleccionFavorita").innerHTML = textoFavorita;

    // Mayoria: jugadores (posición 2, 3 y 4) vs arqueros (posicion 1)
    let arqueros = 0;
    let campo = 0;
    for (let j of jugadores) {
        if (j.posicion == 1) {
            arqueros++;
        } else {
            campo++;
        }
    }

    let emojiTipo = "—";
    if (jugadores.length > 0) {
        if (campo >= arqueros) {
            emojiTipo = "⚽"; // mayoria jugadores
        } else {
            emojiTipo = "🥅"; // mayoria arqueros
        }
    }
    document.querySelector("#statTipoMayoria").innerHTML = emojiTipo;
}

async function EliminarJugador(id) {
    try {
        let t = localStorage.getItem("token");
        PrenderLoader("Eliminando jugador...");
        let response = await fetch(`${URLBASE}/jugadores/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + t
            },
        });

        if (response.ok) {
            MostrarToast("Jugador eliminado", 2000);
            CargarListadoJugadores();
        } else {
            throw response; // delega en ManejarError (incluye 401)
        }
    } catch (error) {
        ManejarError(error);
    } finally {
        ApagarLoader();
    }
}

async function ObtenerJugadores() {
    let t = localStorage.getItem("token");
    let response = await fetch(`${URLBASE}/jugadores`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + t
        },
    });

    if (!response.ok) {
        throw response; // cualquier error (401, 403, 500...) sale por aca
    }
    let data = await response.json();
    return data.jugadores; // aca SOLO se llega si todo salio bien (200-299)
}

// ============================== MAPA ==============================
var map = null;

function CrearMapa() {
    PrenderLoader("Cargando Mapa...")
    setTimeout(function () { CargarMapa() }, 1000);
    ApagarLoader();
}

async function CargarMapa() {
    try {
        PrenderLoader("Cargando mapa...");

        if (map != null) {
            map.remove();
        }
        map = L.map('map').setView([-15.929423460623727, -58.542451590250664], 3.5);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        let paises = await ObtenerPaises();
        let usuariosPorPais = await UsuariosPorPais();

        // ordenamos de mayor a menor por cantidad de usuarios
        for (let i = 0; i < usuariosPorPais.length; i++) {
            let idxMax = i;
            for (let j = i + 1; j < usuariosPorPais.length; j++) {
                if (usuariosPorPais[j].cantidadDeUsuarios > usuariosPorPais[idxMax].cantidadDeUsuarios) {
                    idxMax = j;
                }
            }
            // intercambiamos el mayor encontrado a la posición i
            let temp = usuariosPorPais[i];
            usuariosPorPais[i] = usuariosPorPais[idxMax];
            usuariosPorPais[idxMax] = temp;
        }

        // markers: solo los 10 primeros
        for (let i = 0; i < usuariosPorPais.length && i < 10; i++) {
            let u = usuariosPorPais[i];
            let pais = BuscarPais(u.id, paises);
            if (pais != null) {
                L.marker([pais.latitud, pais.longitud]).addTo(map).bindPopup(`<b>${u.nombre}</b><br><p>${u.cantidadDeUsuarios} usuarios</p>`);
            }
        }
    } catch (error) {
        ManejarError(error);
    } finally {
        ApagarLoader();
    }
}

function BuscarPais(idPais, paises) {
    for (let p of paises) {
        if (p.id == idPais) {
            return p;
        }
    }
    return null;
}

function ObtenerUsuarioPorPais(idPais, listarUsuariosPorPais) {
    for (let u of listarUsuariosPorPais) {
        if (u.id == idPais) {
            return u.cantidadDeUsuarios;
        }
    }
    return 0;
}

async function ObtenerPaises() {
    let t = localStorage.getItem("token");
    let response = await fetch(`${URLBASE}/paises`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + t
        },
    });

    if (!response.ok) {
        throw response;
    }

    let data = await response.json();
    return data.paises;
}

async function UsuariosPorPais() {
    let t = localStorage.getItem("token");
    let response = await fetch(`${URLBASE}/usuariosPorPais`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + t
        },
    });

    if (!response.ok) {
        throw response;
    }

    let data = await response.json();
    return data.paises;
}

// ============================== COMPARTIDAS ==============================
function DatosValidos(datos) {
    for (let d of datos) {
        // .trim() es un metodo para sacar espacios de los bordes
        if (d == null || d.trim() == "") {
            Alertar("IMPORTANTE", "Datos incompletos", "Debés completar todos los campos");
            return false;
        }
    }
    return true;
}

// ============================== COMPONENTES DE UI (loader, alert, toast, errores) ==============================
const loading = document.createElement('ion-loading');
function PrenderLoader(texto) {
    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoader() {
    loading.dismiss();
}

function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}

function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;
    document.body.appendChild(toast);
    toast.present();
}

function ManejarError(error) {
    // si el error es una response con status 401 → sesión vencida
    if (error.status == 401) {
        Alertar("IMPORTANTE", "Sesión vencida", "Volvé a iniciar sesión");
        MandarAlLogin();
    } else {
        console.log(error);
        Alertar("IMPORTANTE", "Error", "Ocurrió un problema. Intentá de nuevo.");
    }
}
