/**
 * =============================================================================
 * cliente-form.js
 * -----------------------------------------------------------------------------
 * Igual que producto-form.js: este único formulario sirve tanto para CREAR
 * un cliente nuevo (nuevo-cliente.html) como para EDITAR uno existente
 * (nuevo-cliente.html?id=cli-001). Valida los campos antes de guardar.
 * =============================================================================
 */

const CLIENTES_KEY = 'acme_clientes';

const formulario = document.querySelector('#form-cliente');

const parametros = new URLSearchParams(window.location.search);
const idAEditar = parametros.get('id');

document.addEventListener('DOMContentLoaded', () => {
  if (idAEditar) prepararModoEdicion(idAEditar);
  formulario.addEventListener('submit', manejarEnvio);
});

function prepararModoEdicion(id) {
  const cliente = Storage.findBy(CLIENTES_KEY, 'id', id);

  if (!cliente) {
    alert('El cliente que intentas editar ya no existe.');
    window.location.href = 'clientes.html';
    return;
  }

  document.querySelector('h2').textContent = 'Editar cliente';
  document.title = 'ACME - Editar cliente';
  document.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

  document.querySelector('#nombre').value = cliente.nombre;
  document.querySelector('#apellido').value = cliente.apellido;
  document.querySelector('#direccion').value = cliente.direccion || '';
  document.querySelector('#correo').value = cliente.correo || '';
  document.querySelector('#telefono').value = cliente.telefono || '';
}

function manejarEnvio(evento) {
  evento.preventDefault();
  limpiarErrores();

  const datos = {
    id: idAEditar || generarId(),
    nombre: document.querySelector('#nombre').value.trim(),
    apellido: document.querySelector('#apellido').value.trim(),
    direccion: document.querySelector('#direccion').value.trim(),
    correo: document.querySelector('#correo').value.trim(),
    telefono: document.querySelector('#telefono').value.trim(),
  };

  const errores = validarCliente(datos);

  if (Object.keys(errores).length > 0) {
    mostrarErrores(errores);
    return;
  }

  if (idAEditar) {
    Storage.updateBy(CLIENTES_KEY, 'id', idAEditar, datos);
  } else {
    Storage.add(CLIENTES_KEY, datos);
  }

  window.location.href = 'clientes.html';
}

function validarCliente(datos) {
  const errores = {};

  // --- NOMBRE: obligatorio, longitud mínima y máxima ---
  if (datos.nombre === '') {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (datos.nombre.length < 2 || datos.nombre.length > 40) {
    errores.nombre = 'El nombre debe tener entre 2 y 40 caracteres.';
  }

  // --- APELLIDO: obligatorio, longitud mínima y máxima ---
  if (datos.apellido === '') {
    errores.apellido = 'El apellido es obligatorio.';
  } else if (datos.apellido.length < 2 || datos.apellido.length > 40) {
    errores.apellido = 'El apellido debe tener entre 2 y 40 caracteres.';
  }

  // --- DIRECCIÓN: opcional, pero si se llena debe tener sentido mínimo ---
  if (datos.direccion !== '' && datos.direccion.length < 5) {
    errores.direccion = 'La dirección es muy corta.';
  }

  // --- CORREO: opcional, pero si se llena debe tener formato válido y
  //     no repetirse con el de otro cliente ---
  if (datos.correo !== '') {
    if (!esCorreoValido(datos.correo)) {
      errores.correo = 'El formato del correo no es válido.';
    } else {
      const clientes = Storage.getAll(CLIENTES_KEY);
      const yaExiste = clientes.some(c =>
        c.correo.toLowerCase() === datos.correo.toLowerCase() && c.id !== idAEditar
      );
      if (yaExiste) errores.correo = 'Ya existe un cliente registrado con ese correo.';
    }
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
