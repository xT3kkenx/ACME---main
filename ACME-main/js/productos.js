/**
 * =============================================================================
 * productos.js
 * -----------------------------------------------------------------------------
 * Lógica exclusiva de la página "Inventario de productos" (productos.html).
 *
 * Qué hace:
 *  1. La primera vez que se abre el sitio, crea en localStorage la lista de
 *     productos de ejemplo (antes estaban "quemados" directo en el HTML).
 *  2. Dibuja la tabla en pantalla leyendo SIEMPRE desde localStorage.
 *  3. Permite eliminar un producto (con confirmación).
 *  4. Permite buscar productos por código o nombre en tiempo real.
 *  5. El botón "Editar" no edita aquí: manda a nuevo-producto.html con el
 *     código del producto en la URL (?codigo=...), y es ese formulario
 *     (producto-form.js) el que se encarga de la edición.
 * =============================================================================
 */

// Llave usada en localStorage para guardar el arreglo de productos.
const PRODUCTOS_KEY = 'acme_productos';

// Datos de ejemplo: son los mismos que antes estaban escritos directo en el
// <table> del HTML. Solo se usan UNA vez, para "sembrar" el localStorage la
// primera vez que alguien abre el sitio en su navegador.
const PRODUCTOS_INICIALES = [
  { codigo: 'FER-001', nombre: 'Tornillo autoperforante 1"', categoria: 'ferreteria', ubicacion: 'bodega', descripcion: '', precioEntrada: 300, precioSalida: 500, unidad: 'Unidad', presentacion: '', cantidad: 20, minima: 10, imagen: '' },
  { codigo: 'PIN-001', nombre: 'Pintura blanca mate 1 galón', categoria: 'pinturas', ubicacion: 'bodega', descripcion: '', precioEntrada: 45000, precioSalida: 68000, unidad: 'Galón', presentacion: '', cantidad: 13, minima: 5, imagen: '' },
  { codigo: 'FON-003', nombre: 'Tubo PVC 1/2"', categoria: 'fontaneria', ubicacion: 'bodega', descripcion: '', precioEntrada: 6000, precioSalida: 9500, unidad: 'Unidad', presentacion: '', cantidad: 40, minima: 10, imagen: '' },
  { codigo: 'CON-001', nombre: 'Cemento gris 50 kg', categoria: 'construccion', ubicacion: 'bodega', descripcion: '', precioEntrada: 28000, precioSalida: 35000, unidad: 'Bulto', presentacion: '', cantidad: 60, minima: 15, imagen: '' },
  { codigo: 'ADH-001', nombre: 'Silicona transparente 300 ml', categoria: 'adhesivos', ubicacion: 'vitrina', descripcion: '', precioEntrada: 8000, precioSalida: 13000, unidad: 'Unidad', presentacion: '', cantidad: 4, minima: 5, imagen: '' },
  { codigo: 'SEG-002', nombre: 'Guantes anticorte', categoria: 'seguridad', ubicacion: 'vitrina', descripcion: '', precioEntrada: 12000, precioSalida: 19000, unidad: 'Par', presentacion: '', cantidad: 6, minima: 5, imagen: '' },
  { codigo: 'HER-003', nombre: 'Taladro percutor 650W', categoria: 'herramientas', ubicacion: 'vitrina', descripcion: '', precioEntrada: 180000, precioSalida: 249000, unidad: 'Unidad', presentacion: '', cantidad: 8, minima: 3, imagen: '' },
  { codigo: 'ADH-002', nombre: 'Pegante de contacto 500 ml', categoria: 'adhesivos', ubicacion: 'bodega', descripcion: '', precioEntrada: 14000, precioSalida: 21000, unidad: 'Unidad', presentacion: '', cantidad: 14, minima: 5, imagen: '' },
  { codigo: 'ELE-002', nombre: 'Interruptor sencillo', categoria: 'electricidad', ubicacion: 'vitrina', descripcion: '', precioEntrada: 4500, precioSalida: 7000, unidad: 'Unidad', presentacion: '', cantidad: 3, minima: 5, imagen: '' },
];

// Esperamos a que el HTML esté completamente cargado antes de tocar el DOM.
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(PRODUCTOS_KEY, PRODUCTOS_INICIALES);

  renderizarTabla(Storage.getAll(PRODUCTOS_KEY));
  configurarBuscador();
});

/**
 * Dibuja (o vuelve a dibujar) el <tbody> de la tabla de productos a partir
 * de un arreglo de productos. Se usa tanto al cargar la página como
 * después de buscar o eliminar.
 */
function renderizarTabla(productos) {
  const tbody = document.querySelector('#tabla-productos tbody');
  tbody.innerHTML = '';

  // Caso: no hay productos (o la búsqueda no encontró nada).
  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No se encontraron productos.</td></tr>';
    return;
  }

  productos.forEach(producto => {
    const fila = document.createElement('tr');

    // Si la cantidad disponible es menor o igual a la mínima, resaltamos
    // la fila para que se note de un vistazo que hay que reabastecer.
    if (Number(producto.cantidad) <= Number(producto.minima)) {
      fila.classList.add('fila-stock-bajo');
    }

    // Ya NO hay una columna "Acciones": los íconos de Editar/Eliminar van
    // dentro de la misma celda de "Disponible", como una pastilla flotante
    // (position:absolute) que está oculta por defecto y solo aparece al
    // pasar el cursor sobre la fila (ver reglas ".icono-flotante-wrap" y
    // "tr:hover" en estilos.css). Por eso la celda de Disponible necesita
    // "position: relative" para que la pastilla se ubique respecto a ella.
    fila.innerHTML = `
      <td>${escaparHtml(producto.codigo)}</td>
      <td>${escaparHtml(producto.nombre)}</td>
      <td class="celda-flotante">
        ${producto.cantidad}
        <span class="icono-flotante-wrap">
          <a href="nuevo-producto.html?codigo=${encodeURIComponent(producto.codigo)}"
             class="icono-accion icono-editar"
             title="Editar producto"
             aria-label="Editar producto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button"
                  class="icono-accion icono-eliminar"
                  title="Eliminar producto"
                  aria-label="Eliminar producto"
                  data-codigo="${escaparHtml(producto.codigo)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
            </svg>
          </button>
        </span>
      </td>
    `;

    tbody.appendChild(fila);
  });

  // Los botones "Eliminar" se crean de nuevo cada vez que se renderiza la
  // tabla, así que hay que volver a engancharles el evento cada vez.
  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarProducto(boton.dataset.codigo));
  });
}

/**
 * Elimina un producto de localStorage (previa confirmación del usuario)
 * y vuelve a pintar la tabla, respetando el texto que haya en el buscador.
 */
function eliminarProducto(codigo) {
  const confirmar = confirm(`¿Seguro que deseas eliminar el producto "${codigo}"?\nEsta acción no se puede deshacer.`);
  if (!confirmar) return;

  Storage.removeBy(PRODUCTOS_KEY, 'codigo', codigo);

  // Volvemos a aplicar el filtro de búsqueda actual (si había alguno) en
  // vez de mostrar todos los productos, para no "perder" la búsqueda.
  const input = document.querySelector('#buscador-productos');
  const termino = input ? input.value : '';
  renderizarTabla(filtrarProductos(termino));
}

/**
 * Conecta el input de búsqueda con la tabla: cada vez que el usuario
 * escribe, se filtra la lista de productos en tiempo real (sin recargar
 * la página ni presionar ningún botón).
 */
function configurarBuscador() {
  const input = document.querySelector('#buscador-productos');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarTabla(filtrarProductos(input.value));
  });
}

/**
 * Devuelve solo los productos cuyo código o nombre contienen el término
 * de búsqueda (sin importar mayúsculas/minúsculas).
 */
function filtrarProductos(termino) {
  const todos = Storage.getAll(PRODUCTOS_KEY);
  const buscado = termino.trim().toLowerCase();

  if (buscado === '') return todos;

  return todos.filter(producto =>
    producto.codigo.toLowerCase().includes(buscado) ||
    producto.nombre.toLowerCase().includes(buscado)
  );
}
