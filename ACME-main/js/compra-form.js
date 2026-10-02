/**
 * =============================================================================
 * compra-form.js
 * -----------------------------------------------------------------------------
 * Mismo patrón que venta-form.js, aplicado a las compras a proveedores.
 * =============================================================================
 */

const COMPRAS_KEY = 'acme_compras';

const formulario = document.querySelector('#form-compra');
const inputValor = document.querySelector('#valor');
const inputCantidad = document.querySelector('#cantidad');
const inputTotal = document.querySelector('#total');

const parametros = new URLSearchParams(window.location.search);
const idAEditar = parametros.get('id');

document.addEventListener('DOMContentLoaded', () => {
  if (idAEditar) prepararModoEdicion(idAEditar);

  inputTotal.readOnly = true;
  inputValor.addEventListener('input', calcularTotal);
  inputCantidad.addEventListener('input', calcularTotal);

  formulario.addEventListener('submit', manejarEnvio);
});

function calcularTotal() {
  const valor = Number(inputValor.value) || 0;
  const cantidad = Number(inputCantidad.value) || 0;
  inputTotal.value = (valor * cantidad).toFixed(2);
}

function prepararModoEdicion(id) {
  const compra = Storage.findBy(COMPRAS_KEY, 'id', id);

  if (!compra) {
    alert('La compra que intentas editar ya no existe.');
    window.location.href = 'compras.html';
    return;
  }

  document.querySelector('h2').textContent = 'Editar compra';
  document.title = 'ACME - Editar compra';
  document.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

  document.querySelector('#proveedor').value = compra.proveedor;
  document.querySelector('#fecha').value = compra.fecha;
  document.querySelector('#producto').value = compra.producto;
  inputValor.value = compra.valor;
  inputCantidad.value = compra.cantidad;
  inputTotal.value = compra.total;
}

function manejarEnvio(evento) {
  evento.preventDefault();
  limpiarErrores();

  const datos = {
    id: idAEditar || generarId(),
    proveedor: document.querySelector('#proveedor').value.trim(),
    fecha: document.querySelector('#fecha').value,
    producto: document.querySelector('#producto').value.trim(),
    valor: inputValor.value.trim(),
    cantidad: inputCantidad.value.trim(),
    total: inputTotal.value.trim(),
  };

  const errores = validarCompra(datos);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    return;
  }

  datos.valor = Number(datos.valor);
  datos.cantidad = Number(datos.cantidad);
  datos.total = Number(datos.total);

  if (idAEditar) {
    Storage.updateBy(COMPRAS_KEY, 'id', idAEditar, datos);
  } else {
    Storage.add(COMPRAS_KEY, datos);
  }

  window.location.href = 'compras.html';
}

function validarCompra(datos) {
  const errores = {};

  if (datos.proveedor === '') errores.proveedor = 'El proveedor es obligatorio.';
  else if (datos.proveedor.length < 2) errores.proveedor = 'Escribe un nombre de proveedor válido.';

  if (datos.fecha === '') errores.fecha = 'La fecha es obligatoria.';

  if (datos.producto === '') errores.producto = 'El producto es obligatorio.';

  if (datos.valor === '') {
    errores.valor = 'El valor unitario es obligatorio.';
  } else if (!esNumeroValido(datos.valor) || Number(datos.valor) < 0) {
    errores.valor = 'Ingresa un valor válido (0 o mayor).';
  }

  if (datos.cantidad === '') {
    errores.cantidad = 'La cantidad es obligatoria.';
  } else if (!esEnteroValido(datos.cantidad) || Number(datos.cantidad) < 1) {
    errores.cantidad = 'Ingresa un número entero de al menos 1.';
  }

  if (datos.total === '' || !esNumeroValido(datos.total)) {
    errores.total = 'No se pudo calcular el total. Revisa el valor y la cantidad.';
  }

  return errores;
}

function mostrarErrores(errores) {
  Object.keys(errores).forEach(id => {
    const input = document.querySelector('#' + id);
    const spanError = document.querySelector('#error-' + id);
    if (input) input.classList.add('input-invalido');
    if (spanError) spanError.textContent = errores[id];
  });

  const primerId = Object.keys(errores)[0];
  const primerInput = document.querySelector('#' + primerId);
  if (primerInput) primerInput.focus();
}

function limpiarErrores() {
  document.querySelectorAll('.field-error').forEach(span => span.textContent = '');
  document.querySelectorAll('.input-invalido').forEach(input => input.classList.remove('input-invalido'));
}
