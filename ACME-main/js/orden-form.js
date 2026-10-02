/**
 * =============================================================================
 * orden-form.js
 * -----------------------------------------------------------------------------
 * Formulario de órdenes de trabajo. Además de crear/editar con validación
 * (como en los módulos anteriores), aquí el campo "Total de venta" se
 * calcula solo (valor unitario x cantidad) cada vez que el usuario cambia
 * cualquiera de esos dos campos: es manipulación del DOM en tiempo real,
 * no algo que el usuario tenga que calcular a mano.
 * =============================================================================
 */

const ORDENES_KEY = 'acme_ordenes';

const formulario = document.querySelector('#form-orden');
const inputValor = document.querySelector('#valor');
const inputCantidad = document.querySelector('#cantidad');
const inputTotal = document.querySelector('#total');

const parametros = new URLSearchParams(window.location.search);
const idAEditar = parametros.get('id');

document.addEventListener('DOMContentLoaded', () => {
  if (idAEditar) prepararModoEdicion(idAEditar);

  // El total se recalcula automáticamente; el usuario ya no lo escribe.
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
  const orden = Storage.findBy(ORDENES_KEY, 'id', id);

  if (!orden) {
    alert('La orden que intentas editar ya no existe.');
    window.location.href = 'ordenes.html';
    return;
  }

  document.querySelector('h2').textContent = 'Editar orden de trabajo';
  document.title = 'ACME - Editar orden';
  document.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

  document.querySelector('#cliente').value = orden.cliente;
  document.querySelector('#responsable').value = orden.responsable;
  document.querySelector('#metodo').value = orden.metodo;
  document.querySelector('#estado').value = orden.estado;
  document.querySelector('#producto').value = orden.producto;
  inputValor.value = orden.valor;
  inputCantidad.value = orden.cantidad;
  inputTotal.value = orden.total;
}

function manejarEnvio(evento) {
  evento.preventDefault();
  limpiarErrores();

  const datos = {
    id: idAEditar || generarId(),
    cliente: document.querySelector('#cliente').value.trim(),
    responsable: document.querySelector('#responsable').value.trim(),
    metodo: document.querySelector('#metodo').value,
    estado: document.querySelector('#estado').value,
    producto: document.querySelector('#producto').value.trim(),
    valor: inputValor.value.trim(),
    cantidad: inputCantidad.value.trim(),
    total: inputTotal.value.trim(),
  };

  const errores = validarOrden(datos);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    return;
  }

  datos.valor = Number(datos.valor);
  datos.cantidad = Number(datos.cantidad);
  datos.total = Number(datos.total);

  if (idAEditar) {
    Storage.updateBy(ORDENES_KEY, 'id', idAEditar, datos);
  } else {
    Storage.add(ORDENES_KEY, datos);
  }

  window.location.href = 'ordenes.html';
}

function validarOrden(datos) {
  const errores = {};

  if (datos.cliente === '') errores.cliente = 'El cliente es obligatorio.';
  else if (datos.cliente.length < 2) errores.cliente = 'Escribe un nombre de cliente válido.';

  if (datos.responsable === '') errores.responsable = 'El responsable es obligatorio.';
  else if (datos.responsable.length < 2) errores.responsable = 'Escribe un nombre de responsable válido.';

  if (datos.metodo === '') errores.metodo = 'Selecciona un método de pago.';
  if (datos.estado === '') errores.estado = 'Selecciona el estado de la orden.';

  if (datos.producto === '') errores.producto = 'El producto o servicio es obligatorio.';

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

  // El total se calcula solo, pero igual se valida por si el navegador
  // no alcanzó a ejecutar el JavaScript de cálculo (por ejemplo, al
  // editar campos muy rápido).
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
