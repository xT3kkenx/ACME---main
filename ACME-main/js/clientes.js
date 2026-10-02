/**
 * =============================================================================
 * clientes.js
 * -----------------------------------------------------------------------------
 * Lógica de la página "Lista de clientes" (clientes.html). Mismo patrón que
 * productos.js: se lee/escribe siempre en localStorage, la tabla se dibuja
 * por JavaScript, hay buscador en tiempo real y los íconos de Editar/
 * Eliminar aparecen flotando sobre la última columna al pasar el cursor
 * sobre la fila (ver .celda-flotante en estilos.css).
 * =============================================================================
 */

const CLIENTES_KEY = 'acme_clientes';

// Datos de ejemplo, usados solo la primera vez que se abre el sitio.
const CLIENTES_INICIALES = [
  { id: 'cli-001', nombre: 'Juan', apellido: 'Perez', direccion: 'Calle 10 #15-20', correo: 'juan@gmail.com', telefono: '3000000000' },
  { id: 'cli-002', nombre: 'Andres', apellido: 'Ortiga', direccion: 'Calle 9 #15-20', correo: 'andres@gmail.com', telefono: '3010000000' },
  { id: 'cli-003', nombre: 'Carlos', apellido: 'Sanza', direccion: 'Calle 10 #15-30', correo: 'carlos@gmail.com', telefono: '3020000000' },
  { id: 'cli-004', nombre: 'Maria', apellido: 'Martinez', direccion: 'Cra 10 #15-20', correo: 'maria@gmail.com', telefono: '3030000000' },
];

document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(CLIENTES_KEY, CLIENTES_INICIALES);
  renderizarTabla(Storage.getAll(CLIENTES_KEY));
  configurarBuscador();
});

function renderizarTabla(clientes) {
  const tbody = document.querySelector('#tabla-clientes tbody');
  tbody.innerHTML = '';

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron clientes.</td></tr>';
    return;
  }

  clientes.forEach(cliente => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${escaparHtml(cliente.nombre)}</td>
      <td>${escaparHtml(cliente.apellido)}</td>
      <td>${escaparHtml(cliente.direccion)}</td>
      <td>${escaparHtml(cliente.correo)}</td>
      <td class="celda-flotante">
        ${escaparHtml(cliente.telefono)}
        <span class="icono-flotante-wrap">
          <a href="nuevo-cliente.html?id=${encodeURIComponent(cliente.id)}"
             class="icono-accion icono-editar"
             title="Editar cliente"
             aria-label="Editar cliente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button"
                  class="icono-accion icono-eliminar"
                  title="Eliminar cliente"
                  aria-label="Eliminar cliente"
                  data-id="${escaparHtml(cliente.id)}">
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

  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarCliente(boton.dataset.id));
  });
}

function eliminarCliente(id) {
  const cliente = Storage.findBy(CLIENTES_KEY, 'id', id);
  const nombreCompleto = cliente ? `${cliente.nombre} ${cliente.apellido}` : id;

  const confirmar = confirm(`¿Seguro que deseas eliminar al cliente "${nombreCompleto}"?\nEsta acción no se puede deshacer.`);
  if (!confirmar) return;

  Storage.removeBy(CLIENTES_KEY, 'id', id);

  const input = document.querySelector('#buscador-clientes');
  renderizarTabla(filtrarClientes(input ? input.value : ''));
}

function configurarBuscador() {
  const input = document.querySelector('#buscador-clientes');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarTabla(filtrarClientes(input.value));
  });
}

function filtrarClientes(termino) {
  const todos = Storage.getAll(CLIENTES_KEY);
  const buscado = termino.trim().toLowerCase();

  if (buscado === '') return todos;

  return todos.filter(c =>
    c.nombre.toLowerCase().includes(buscado) ||
    c.apellido.toLowerCase().includes(buscado) ||
    (c.correo || '').toLowerCase().includes(buscado)
  );
}
