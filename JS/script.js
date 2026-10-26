/* Parte de Andres */

/* agarro los elementos del html que voy a usar mas abajo */
const grid = document.querySelector(".grid");
const buscador = document.getElementById("searchInput");
const selectorOrden = document.getElementById("sortSelect");
const botonesCategoria = document.querySelectorAll(".pill");
const contadorCarrito = document.getElementById("cartCount");
const aviso = document.getElementById("toast");

/* guardo todas las tarjetas en una lista, en el mismo orden en que
   estan escritas en el html. ese orden lo uso para "mas populares" */
const tarjetas = Array.from(document.querySelectorAll(".card"));

/* variables donde voy guardando lo que va eligiendo el usuario */
let categoriaActiva = "todos";
let textoBusqueda = "";
let orden = "popular";
let cantidadCarrito = 0;

/* pasa un texto a minuscula y le saca los acentos, asi si alguien
   busca "sandwich" tambien encuentra "sándwich" */
function limpiarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* las tarjetas no dicen a que categoria pertenecen, asi que la
   deduzco del nombre buscando una palabra clave */
function detectarCategoria(nombre) {
  const n = limpiarTexto(nombre);

  if (n.includes("hamburguesa")) return "hamburguesas";
  if (n.includes("pizza")) return "pizzas";
  if (n.includes("empanada")) return "empanadas";
  if (n.includes("sandwich")) return "sandwiches";
  if (n.includes("coca") || n.includes("gaseosa") || n.includes("agua")) return "bebidas";

  return "otros";
}

/* saco el precio como numero a partir del texto de la tarjeta.
   busco todo lo que empiece con "$" (las empanadas tienen dos precios)
   y me quedo con el mas barato para poder ordenar */
function obtenerPrecio(tarjeta) {
  const texto = tarjeta.querySelector(".price").textContent;
  const precios = texto.match(/\$\s?[\d.]+/g) || [];

  const numeros = precios.map(function (p) {
    return Number(p.replace(/\D/g, ""));
  });

  return Math.min.apply(null, numeros);
}

/* armo una lista con los datos de cada tarjeta (nombre, categoria y
   precio) una sola vez al empezar, asi no lo calculo en cada click */
const datos = tarjetas.map(function (tarjeta) {
  const nombre = tarjeta.querySelector("h3").textContent;

  return {
    elemento: tarjeta,
    nombre: nombre,
    categoria: detectarCategoria(nombre),
    precio: obtenerPrecio(tarjeta)
  };
});

/* mensaje que se muestra cuando no hay ningun resultado. la clase
   "empty" ya tiene su estilo en el css */
const mensajeVacio = document.createElement("div");
mensajeVacio.className = "empty";
mensajeVacio.textContent = "no se encontraron productos que coincidan con tu busqueda";

/* funcion principal: filtra, ordena y vuelve a mostrar las tarjetas.
   la llamo cada vez que el usuario toca algo */
function actualizarCatalogo() {

  /* paso 1: me quedo solo con los productos que cumplen la categoria
     elegida y lo que se escribio en el buscador */
  let visibles = datos.filter(function (item) {
    const coincideCategoria = categoriaActiva === "todos" || item.categoria === categoriaActiva;
    const coincideBusqueda = limpiarTexto(item.nombre).includes(limpiarTexto(textoBusqueda));

    return coincideCategoria && coincideBusqueda;
  });

  /* paso 2: ordeno segun lo que eligio en el select. si es "popular"
     no hago nada porque ya estan en el orden original */
  if (orden === "price-asc") {
    visibles.sort(function (a, b) {
      return a.precio - b.precio;
    });
  } else if (orden === "price-desc") {
    visibles.sort(function (a, b) {
      return b.precio - a.precio;
    });
  } else if (orden === "name") {
    visibles.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }

  /* paso 3: vacio la grilla y vuelvo a poner solo las tarjetas que
     quedaron, ya en el orden correcto */
  grid.innerHTML = "";

  if (visibles.length === 0) {
    grid.appendChild(mensajeVacio);
    return;
  }

  visibles.forEach(function (item) {
    grid.appendChild(item.elemento);
  });
}

/* botones de categoria: al hacer click guardo cual es (usando el texto
   del boton), le paso la clase "active" (el naranja) y actualizo */
botonesCategoria.forEach(function (boton) {
  boton.addEventListener("click", function () {
    categoriaActiva = limpiarTexto(boton.textContent);

    botonesCategoria.forEach(function (b) {
      b.classList.remove("active");
    });
    boton.classList.add("active");

    actualizarCatalogo();
  });
});

/* buscador: cada vez que se escribe una letra guardo el texto y
   actualizo la grilla en el momento */
buscador.addEventListener("input", function () {
  textoBusqueda = buscador.value;
  actualizarCatalogo();
});

/* select de ordenar: cuando cambia la opcion la guardo y actualizo */
selectorOrden.addEventListener("change", function () {
  orden = selectorOrden.value;
  actualizarCatalogo();
});

/* muestra el cartelito de abajo un ratito y despues lo
   esconde sacandole la clase show */
let temporizadorAviso;
function mostrarAviso(mensaje) {
  aviso.textContent = mensaje;
  aviso.classList.add("show");

  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    aviso.classList.remove("show");
  }, 1800);
}

/* botones de +: a cada uno le agrego un click que suma uno al
   carrito, muestra el aviso y pone el boton verde un instante */
datos.forEach(function (item) {
  const botonAgregar = item.elemento.querySelector(".add-btn");

  botonAgregar.addEventListener("click", function () {
    cantidadCarrito++;
    contadorCarrito.textContent = cantidadCarrito;
    mostrarAviso(item.nombre + " agregado al carrito");

    botonAgregar.classList.add("added");
    botonAgregar.textContent = "✓";
    setTimeout(function () {
      botonAgregar.classList.remove("added");
      botonAgregar.textContent = "+";
    }, 700);
  });
});

/* la llamo una vez al principio para que la pagina arranque ordenada */
actualizarCatalogo();

/* Fin parte de Andres */

