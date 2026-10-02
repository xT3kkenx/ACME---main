/**
 * =============================================================================
 * proveedores.js
 * -----------------------------------------------------------------------------
 * Mismo patrón que clientes.js / productos.js, aplicado a proveedores.
 * =============================================================================
 */

const PROVEEDORES_KEY = 'acme_proveedores';

const PROVEEDORES_INICIALES = [
  { id: 'prov-001', nombre: 'Ferreimport S.A.S', contacto: 'Nicolas Vasquez', direccion: 'Zona Industrial', correo: 'ferre@gmail.com', telefono: '3100000000' },
  { id: 'prov-002', nombre: 'Pinturas Andinas Ltda', contacto: 'Ans Astudillo', direccion: 'Calle 100 #20-4', correo: 'pinturas@gmail.com', telefono: '3110000000' },
  { id: 'prov-003', nombre: 'Electrico Colombia S.A', contacto: 'Mopan Duran', direccion: 'Avenida Principal', correo: 'electrico@gmail.com', telefono: '3120000000' },
  { id: 'prov-004', nombre: 'PVC Solutions', contacto: 'Camilo Ruiz', direccion: 'Avenida Principal', correo: 'pvc@gmail.com', telefono: '3130000000' },
  { id: 'prov-005', nombre: 'Seguridad Industrial Pro', contacto: 'Manuel Inchima', direccion: 'Calle 70 #40-3', correo: 'seguridad@gmail.com', telefono: '3140000000' },
];

document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(PROVEEDORES_KEY, PROVEEDORES_INICIALES);
  renderizarTabla(Storage.getAll(PROVEEDORES_KEY));
  configurarBuscador();
});

function renderizarTabla(proveedores) {
  const tbody = document.querySelector('#tabla-proveedores tbody');
  tbody.innerHTML = '';

  if (proveedores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron proveedores.</td></tr>';
    return;
  }

  proveedores.forEach(proveedor => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${escaparHtml(proveedor.nombre)}</td>
      <td>${escaparHtml(proveedor.contacto)}</td>
      <td>${escaparHtml(proveedor.direccion)}</td>
      <td>${escaparHtml(proveedor.correo)}</td>
      <td class="celda-flotante">
        ${escaparHtml(proveedor.telefono)}
        <span class="icono-flotante-wrap">
          <a href="nuevo-proveedor.html?id=${encodeURIComponent(proveedor.id)}"
             class="icono-accion icono-editar"
             title="Editar proveedor"
             aria-label="Editar proveedor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button"
                  class="icono-accion icono-eliminar"
                  title="Eliminar proveedor"
                  aria-label="Eliminar proveedor"
                  data-id="${escaparHtml(proveedor.id)}">
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
    boton.addEventListener('click', () => eliminarProveedor(boton.dataset.id));
  });
}

function eliminarProveedor(id) {
  const proveedor = Storage.findBy(PROVEEDORES_KEY, 'id', id);
  const nombre = proveedor ? proveedor.nombre : id;

  const confirmar = confirm(`¿Seguro que deseas eliminar al proveedor "${nombre}"?\nEsta acción no se puede deshacer.`);
  if (!confirmar) return;

  Storage.removeBy(PROVEEDORES_KEY, 'id', id);

  const input = document.querySelector('#buscador-proveedores');
  renderizarTabla(filtrarProveedores(input ? input.value : ''));
}

function configurarBuscador() {
  const input = document.querySelector('#buscador-proveedores');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarTabla(filtrarProveedores(input.value));
  });
}

function filtrarProveedores(termino) {
  const todos = Storage.getAll(PROVEEDORES_KEY);
  const buscado = termino.trim().toLowerCase();

  if (buscado === '') return todos;

  return todos.filter(p =>
    p.nombre.toLowerCase().includes(buscado) ||
    p.contacto.toLowerCase().includes(buscado)
  );
}
