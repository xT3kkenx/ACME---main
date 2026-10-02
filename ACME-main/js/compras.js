/**
 * =============================================================================
 * compras.js
 * -----------------------------------------------------------------------------
 * Mismo patrón que ventas.js, aplicado a las compras a proveedores.
 * =============================================================================
 */

const COMPRAS_KEY = 'acme_compras';

const COMPRAS_INICIALES = [
  { id: 'compra-001', proveedor: 'FerreImport S.A.S', fecha: '2026-09-01', producto: 'Tornillo autoperforante 1"', valor: 50000, cantidad: 10, total: 500000 },
  { id: 'compra-002', proveedor: 'PVC Solutions', fecha: '2026-09-04', producto: 'Tubo PVC 1/2"', valor: 60000, cantidad: 5, total: 300000 },
  { id: 'compra-003', proveedor: 'Electrico Colombia S.A', fecha: '2026-09-08', producto: 'Interruptor sencillo', valor: 50000, cantidad: 8, total: 400000 },
  { id: 'compra-004', proveedor: 'Materiales Constructivos', fecha: '2026-09-12', producto: 'Cemento gris 50 kg', valor: 50000, cantidad: 12, total: 600000 },
];

document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(COMPRAS_KEY, COMPRAS_INICIALES);
  renderizarTabla(Storage.getAll(COMPRAS_KEY));
  configurarBuscador();
});

function renderizarTabla(compras) {
  const tbody = document.querySelector('#tabla-compras tbody');
  tbody.innerHTML = '';

  if (compras.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No se encontraron compras.</td></tr>';
    return;
  }

  compras.forEach(compra => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${escaparHtml(compra.proveedor)}</td>
      <td>${compra.cantidad}</td>
      <td class="celda-flotante">
        ${formatoMoneda(compra.total)}
        <span class="icono-flotante-wrap">
          <a href="nueva-compra.html?id=${encodeURIComponent(compra.id)}"
             class="icono-accion icono-editar"
             title="Editar compra"
             aria-label="Editar compra">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button"
                  class="icono-accion icono-eliminar"
                  title="Eliminar compra"
                  aria-label="Eliminar compra"
                  data-id="${escaparHtml(compra.id)}">
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
    boton.addEventListener('click', () => eliminarCompra(boton.dataset.id));
  });
}

function eliminarCompra(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar esta compra?\nEsta acción no se puede deshacer.');
  if (!confirmar) return;

  Storage.removeBy(COMPRAS_KEY, 'id', id);

  const input = document.querySelector('#buscador-compras');
  renderizarTabla(filtrarCompras(input ? input.value : ''));
}

function configurarBuscador() {
  const input = document.querySelector('#buscador-compras');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarTabla(filtrarCompras(input.value));
  });
}

function filtrarCompras(termino) {
  const todas = Storage.getAll(COMPRAS_KEY);
  const buscado = termino.trim().toLowerCase();

  if (buscado === '') return todas;

  return todas.filter(c =>
    c.proveedor.toLowerCase().includes(buscado) ||
    c.producto.toLowerCase().includes(buscado)
  );
}
