/* Parte de Andres */

/* agarro los elementos del html que voy a usar */
const enlacesCategoria = document.querySelectorAll(".menu-categorias a");
const secciones = document.querySelectorAll(".catalogo-seccion");
const botonesAgregar = document.querySelectorAll(".add-btn");
const iconoCarrito = document.querySelector(".nav-icons a");

/* variable donde guardo que categoria esta elegida. si esta vacia
   es porque se estan viendo todas las secciones */
let categoriaActiva = "";

/* el pedido lo guardo en el navegador con localstorage, asi no se
   pierde al cambiar de pagina. si todavia no hay nada, arranca vacio */
let pedido = JSON.parse(localStorage.getItem("pedido")) || [];

/* filtro por categoria */

/* muestra solo la seccion elegida y esconde las demas. si no hay
   ninguna elegida, muestra todas */
function mostrarCategoria() {
  secciones.forEach(function (seccion) {
    if (categoriaActiva === "" || seccion.id === categoriaActiva) {
      seccion.style.display = "";
    } else {
      seccion.style.display = "none";
    }
  });

  /* marco con la clase "active" el link de la categoria elegida */
  enlacesCategoria.forEach(function (enlace) {
    const id = enlace.getAttribute("href").replace("#", "");
    enlace.classList.toggle("active", id === categoriaActiva);
  });
}

/* al hacer click en una categoria, cancelo el salto normal del link
   y filtro. si toca la que ya estaba elegida, vuelve a mostrar todo */
enlacesCategoria.forEach(function (enlace) {
  enlace.addEventListener("click", function (evento) {
    evento.preventDefault();

    const id = enlace.getAttribute("href").replace("#", "");

    if (categoriaActiva === id) {
      categoriaActiva = "";
    } else {
      categoriaActiva = id;
    }

    mostrarCategoria();
  });
});

/* cartel de aviso */

/* creo el cartelito de abajo desde js porque menu.html no lo tiene.
   el estilo ya esta en el css (#toast y #toast.show) */
const aviso = document.createElement("div");
aviso.id = "toast";
document.body.appendChild(aviso);

let temporizadorAviso;
function mostrarAviso(mensaje) {
  aviso.textContent = mensaje;
  aviso.classList.add("show");

  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () {
    aviso.classList.remove("show");
  }, 1800);
}

/* contador del carrito */

/* creo el numerito naranja arriba del carrito. el icono es un link,
   asi que le pongo position relative para que el numerito se ubique
   en base a el */
const contador = document.createElement("span");
contador.className = "cart-count";
iconoCarrito.style.position = "relative";
iconoCarrito.appendChild(contador);

/* suma todas las cantidades del pedido y las muestra en el numerito.
   si no hay nada lo escondo */
function actualizarContador() {
  let total = 0;

  pedido.forEach(function (producto) {
    total += producto.cantidad;
  });

  contador.textContent = total;
  contador.style.display = total === 0 ? "none" : "flex";
}

/* agregar al pedido */

/* saco el precio como numero a partir del texto ("$9.500" pasa a 9500) */
function obtenerPrecio(texto) {
  const precio = texto.match(/\$\s?[\d.]+/);
  return precio ? Number(precio[0].replace(/\D/g, "")) : 0;
}

/* al tocar el "+", en vez de saltar directo a pedidos.html, guardo el
   producto en el pedido, actualizo el contador y muestro el aviso */
botonesAgregar.forEach(function (boton) {
  boton.addEventListener("click", function (evento) {
    evento.preventDefault();

    const tarjeta = boton.closest(".card");
    const nombre = tarjeta.querySelector("h3").textContent;
    const precio = obtenerPrecio(tarjeta.querySelector(".price").textContent);

    /* si el producto ya estaba en el pedido le sumo uno, si no lo creo */
    const existente = pedido.find(function (producto) {
      return producto.nombre === nombre;
    });

    if (existente) {
      existente.cantidad++;
    } else {
      pedido.push({ nombre: nombre, precio: precio, cantidad: 1 });
    }

    localStorage.setItem("pedido", JSON.stringify(pedido));

    actualizarContador();
    mostrarAviso(nombre + " agregado al pedido");
  });
});

/* al cargar la pagina muestro todas las secciones y el contador
   con lo que ya habia guardado */
mostrarCategoria();
actualizarContador();

/* Fin parte de Andres */

