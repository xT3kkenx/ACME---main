/**
 * =============================================================================
 * producto-form.js
 * -----------------------------------------------------------------------------
 * Lógica del formulario de producto (nuevo-producto.html).
 *
 * Este MISMO formulario se usa para dos cosas:
 *   - Crear un producto nuevo   -> se abre como nuevo-producto.html
 *   - Editar un producto existente -> se abre como
 *     nuevo-producto.html?codigo=FER-001 (el link "Editar" de la tabla de
 *     productos.html agrega ese "?codigo=..." automáticamente).
 *
 * Al cargar, revisamos si la URL trae "?codigo=...". Si lo trae, estamos en
 * modo EDICIÓN: rellenamos el formulario con los datos existentes y cambiamos
 * los textos de la página. Si no lo trae, estamos en modo CREACIÓN normal.
 *
 * Antes de guardar, validamos todos los campos con JavaScript (obligatorios,
 * vacíos, numéricos, rangos, longitud, y una regla específica del negocio:
 * el precio de salida no puede ser menor al de entrada).
 * =============================================================================
 */

const PRODUCTOS_KEY = 'acme_productos';

// Referencias a elementos del DOM que vamos a usar varias veces.
const formulario = document.querySelector('#form-producto');
const inputCodigo = document.querySelector('#codigo');
const inputImagen = document.querySelector('#imagen');

// ¿La URL trae "?codigo=algo"? Si sí, es el código del producto a editar.
const parametros = new URLSearchParams(window.location.search);
const codigoAEditar = parametros.get('codigo');

// Guarda temporalmente la imagen ya existente cuando estamos editando y el
// usuario no selecciona un archivo nuevo (para no perderla al guardar).
let imagenActual = '';

document.addEventListener('DOMContentLoaded', () => {
  if (codigoAEditar) {
    prepararModoEdicion(codigoAEditar);
  }

  formulario.addEventListener('submit', manejarEnvio);
});

/**
 * Deja el formulario listo para editar: busca el producto en localStorage,
 * rellena todos los campos con sus valores actuales y ajusta los textos
 * de la página (título y botón) para que diga "Editar" en vez de "Nuevo".
 */
function prepararModoEdicion(codigo) {
  const producto = Storage.findBy(PRODUCTOS_KEY, 'codigo', codigo);

  if (!producto) {
    alert('El producto que intentas editar ya no existe.');
    window.location.href = 'productos.html';
    return;
  }

  document.querySelector('h2').textContent = 'Editar producto';
  document.title = 'ACME - Editar producto';
  document.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

  inputCodigo.value = producto.codigo;
  // El código es la "llave" del producto, así que en edición no se debe
  // poder cambiar (si no, técnicamente estaríamos creando uno nuevo).
  inputCodigo.readOnly = true;

  document.querySelector('#nombre').value = producto.nombre;
  document.querySelector('#categoria').value = producto.categoria;
  document.querySelector('#ubicacion').value = producto.ubicacion;
  document.querySelector('#descripcion').value = producto.descripcion || '';
  document.querySelector('#precioEntrada').value = producto.precioEntrada;
  document.querySelector('#precioSalida').value = producto.precioSalida;
  document.querySelector('#unidad').value = producto.unidad;
  document.querySelector('#presentacion').value = producto.presentacion || '';
  document.querySelector('#cantidad').value = producto.cantidad;
  document.querySelector('#minima').value = producto.minima;

  imagenActual = producto.imagen || '';
}

/**
 * Se ejecuta al enviar el formulario (crear o editar). Primero valida
 * todos los campos; si algo falla, muestra los errores y NO guarda nada.
 * Si todo está bien, guarda en localStorage y regresa a productos.html.
 */
function manejarEnvio(evento) {
  evento.preventDefault(); // Evita que la página se recargue (no hay backend real).

  limpiarErrores();

  const datos = {
    codigo: inputCodigo.value.trim().toUpperCase(),
    nombre: document.querySelector('#nombre').value.trim(),
    categoria: document.querySelector('#categoria').value,
    ubicacion: document.querySelector('#ubicacion').value,
    descripcion: document.querySelector('#descripcion').value.trim(),
    precioEntrada: document.querySelector('#precioEntrada').value.trim(),
    precioSalida: document.querySelector('#precioSalida').value.trim(),
    unidad: document.querySelector('#unidad').value.trim(),
    presentacion: document.querySelector('#presentacion').value.trim(),
    cantidad: document.querySelector('#cantidad').value.trim(),
    minima: document.querySelector('#minima').value.trim(),
  };

  const errores = validarProducto(datos);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    return;
  }

  // Convertimos los campos numéricos de texto a número antes de guardar.
  datos.precioEntrada = Number(datos.precioEntrada);
  datos.precioSalida = Number(datos.precioSalida);
  datos.cantidad = Number(datos.cantidad);
  datos.minima = Number(datos.minima);

  // Si el usuario eligió un archivo de imagen, lo convertimos a una URL
  // en base64 (así se puede guardar como texto dentro de localStorage).
  // Si no eligió ninguno, conservamos la imagen que ya tenía (en edición)
  // o se guarda vacío (en creación).
  const archivo = inputImagen.files[0];

  if (archivo) {
    const lector = new FileReader();
    lector.onload = () => {
      datos.imagen = lector.result;
      guardarProducto(datos);
    };
    lector.readAsDataURL(archivo);
  } else {
    datos.imagen = imagenActual;
    guardarProducto(datos);
  }
}

/**
 * Revisa cada campo del formulario y devuelve un objeto con los mensajes
 * de error encontrados. La llave es el id del campo y el valor es el
 * mensaje a mostrar. Si el objeto queda vacío, significa que todo es
 * válido.
 */
function validarProducto(datos) {
  const errores = {};

  // --- CÓDIGO: obligatorio, formato específico (ej. FER-001) ---
  if (datos.codigo === '') {
    errores.codigo = 'El código es obligatorio.';
  } else if (!/^[A-Z]{2,4}-\d{3,4}$/.test(datos.codigo)) {
    errores.codigo = 'Formato inválido. Usa letras-números, ej. FER-001.';
  } else if (!codigoAEditar) {
    // Solo al crear (no al editar) revisamos que el código no exista ya.
    const existe = Storage.findBy(PRODUCTOS_KEY, 'codigo', datos.codigo);
    if (existe) errores.codigo = 'Ya existe un producto con ese código.';
  }

  // --- NOMBRE: obligatorio, longitud mínima y máxima ---
  if (datos.nombre === '') {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (datos.nombre.length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
  } else if (datos.nombre.length > 80) {
    errores.nombre = 'El nombre no puede superar los 80 caracteres.';
  }

  // --- CATEGORÍA Y UBICACIÓN: obligatorias (son <select>) ---
  if (datos.categoria === '') errores.categoria = 'Selecciona una categoría.';
  if (datos.ubicacion === '') errores.ubicacion = 'Selecciona una ubicación.';

  // --- PRECIO DE ENTRADA: obligatorio, numérico, no negativo ---
  if (datos.precioEntrada === '') {
    errores.precioEntrada = 'El precio de entrada es obligatorio.';
  } else if (!esNumeroValido(datos.precioEntrada) || Number(datos.precioEntrada) < 0) {
    errores.precioEntrada = 'Ingresa un precio válido (0 o mayor).';
  }

  // --- PRECIO DE SALIDA: obligatorio, numérico, no negativo, y regla de
  //     negocio propia del sistema: no puede ser menor al de entrada ---
  if (datos.precioSalida === '') {
    errores.precioSalida = 'El precio de salida es obligatorio.';
  } else if (!esNumeroValido(datos.precioSalida) || Number(datos.precioSalida) < 0) {
    errores.precioSalida = 'Ingresa un precio válido (0 o mayor).';
  } else if (
    esNumeroValido(datos.precioEntrada) &&
    Number(datos.precioSalida) < Number(datos.precioEntrada)
  ) {
    errores.precioSalida = 'El precio de salida no puede ser menor al de entrada.';
  }

  // --- UNIDAD: obligatoria ---
  if (datos.unidad === '') errores.unidad = 'La unidad es obligatoria.';

  // --- CANTIDAD DISPONIBLE: obligatoria, numérica (entera), no negativa ---
  if (datos.cantidad === '') {
    errores.cantidad = 'La cantidad disponible es obligatoria.';
  } else if (!esEnteroValido(datos.cantidad) || Number(datos.cantidad) < 0) {
    errores.cantidad = 'Ingresa un número entero válido (0 o mayor).';
  }

  // --- CANTIDAD MÍNIMA: obligatoria, numérica (entera), no negativa ---
  if (datos.minima === '') {
    errores.minima = 'La cantidad mínima es obligatoria.';
  } else if (!esEnteroValido(datos.minima) || Number(datos.minima) < 0) {
    errores.minima = 'Ingresa un número entero válido (0 o mayor).';
  }

  return errores;
}

// Un "número válido" acepta enteros o decimales (para los precios).
// Un "entero válido" solo acepta dígitos (para cantidades, sin decimales).
// (Ambas funciones viven ahora en js/utilidades.js, junto con escaparHtml
// y demás ayudas que se reutilizan en Clientes, Proveedores, Órdenes, etc.)

/**
 * Guarda el producto (crea o actualiza según corresponda) y regresa a la
 * lista de productos.
 */
function guardarProducto(datos) {
  if (codigoAEditar) {
    Storage.updateBy(PRODUCTOS_KEY, 'codigo', codigoAEditar, datos);
  } else {
    Storage.add(PRODUCTOS_KEY, datos);
  }

  window.location.href = 'productos.html';
}

/**
 * Muestra cada mensaje de error justo debajo de su campo correspondiente
 * y le agrega al input la clase "input-invalido" (borde rojo).
 */
function mostrarErrores(errores) {
  Object.keys(errores).forEach(id => {
    const input = document.querySelector('#' + id);
    const spanError = document.querySelector('#error-' + id);

    if (input) input.classList.add('input-invalido');
    if (spanError) spanError.textContent = errores[id];
  });

  // Llevamos la vista hasta el primer campo con error para que el
  // usuario lo vea de inmediato, sobre todo útil en pantallas de celular.
  const primerId = Object.keys(errores)[0];
  const primerInput = document.querySelector('#' + primerId);
  if (primerInput) primerInput.focus();
}

/**
 * Limpia todos los mensajes de error y los bordes rojos antes de volver
 * a validar (se llama al inicio de cada intento de envío).
 */
function limpiarErrores() {
  document.querySelectorAll('.field-error').forEach(span => span.textContent = '');
  document.querySelectorAll('.input-invalido').forEach(input => input.classList.remove('input-invalido'));
}
