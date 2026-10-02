/**
 * =============================================================================
 * proveedor-form.js
 * -----------------------------------------------------------------------------
 * Mismo patrón que cliente-form.js, aplicado a proveedores.
 * =============================================================================
 */

const PROVEEDORES_KEY = 'acme_proveedores';

const formulario = document.querySelector('#form-proveedor');

const parametros = new URLSearchParams(window.location.search);
const idAEditar = parametros.get('id');

document.addEventListener('DOMContentLoaded', () => {
  if (idAEditar) prepararModoEdicion(idAEditar);
  formulario.addEventListener('submit', manejarEnvio);
});

function prepararModoEdicion(id) {
  const proveedor = Storage.findBy(PROVEEDORES_KEY, 'id', id);

  if (!proveedor) {
    alert('El proveedor que intentas editar ya no existe.');
    window.location.href = 'proveedores.html';
    return;
  }

  document.querySelector('h2').textContent = 'Editar proveedor';
  document.title = 'ACME - Editar proveedor';
  document.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

  document.querySelector('#nombre').value = proveedor.nombre;
  document.querySelector('#contacto').value = proveedor.contacto;
  document.querySelector('#direccion').value = proveedor.direccion || '';
  document.querySelector('#correo').value = proveedor.correo || '';
  document.querySelector('#telefono').value = proveedor.telefono || '';
}

function manejarEnvio(evento) {
  evento.preventDefault();
  limpiarErrores();

  const datos = {
    id: idAEditar || generarId(),
    nombre: document.querySelector('#nombre').value.trim(),
    contacto: document.querySelector('#contacto').value.trim(),
    direccion: document.querySelector('#direccion').value.trim(),
    correo: document.querySelector('#correo').value.trim(),
    telefono: document.querySelector('#telefono').value.trim(),
  };

  const errores = validarProveedor(datos);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    return;
  }

  if (idAEditar) {
    Storage.updateBy(PROVEEDORES_KEY, 'id', idAEditar, datos);
  } else {
    Storage.add(PROVEEDORES_KEY, datos);
  }

  window.location.href = 'proveedores.html';
}

function validarProveedor(datos) {
  const errores = {};

  // --- NOMBRE (razón social): obligatorio, longitud mínima/máxima,
  //     y no se debe repetir entre proveedores ---
  if (datos.nombre === '') {
    errores.nombre = 'El nombre del proveedor es obligatorio.';
  } else if (datos.nombre.length < 3 || datos.nombre.length > 60) {
    errores.nombre = 'El nombre debe tener entre 3 y 60 caracteres.';
  } else {
    const proveedores = Storage.getAll(PROVEEDORES_KEY);
    const yaExiste = proveedores.some(p =>
      p.nombre.toLowerCase() === datos.nombre.toLowerCase() && p.id !== idAEditar
    );
    if (yaExiste) errores.nombre = 'Ya existe un proveedor con ese nombre.';
  }

  // --- CONTACTO: obligatorio ---
  if (datos.contacto === '') {
    errores.contacto = 'El nombre de contacto es obligatorio.';
  } else if (datos.contacto.length < 2 || datos.contacto.length > 40) {
    errores.contacto = 'El contacto debe tener entre 2 y 40 caracteres.';
  }

  // --- DIRECCIÓN: opcional, pero si se llena debe tener sentido mínimo ---
  if (datos.direccion !== '' && datos.direccion.length < 5) {
    errores.direccion = 'La dirección es muy corta.';
  }

  // --- CORREO: opcional, pero si se llena debe ser válido ---
  if (datos.correo !== '' && !esCorreoValido(datos.correo)) {
    errores.correo = 'El formato del correo no es válido.';
  }

  // --- TELÉFONO: opcional, pero si se llena debe ser numérico (7-10 dígitos) ---
  if (datos.telefono !== '' && !esTelefonoValido(datos.telefono)) {
    errores.telefono = 'Ingresa solo números (entre 7 y 10 dígitos).';
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
