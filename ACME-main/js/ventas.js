/**
 * =============================================================================
 * ventas.js
 * -----------------------------------------------------------------------------
 * Mismo patrón que los módulos anteriores, aplicado a las ventas.
 * =============================================================================
 */

const VENTAS_KEY = 'acme_ventas';

const VENTAS_INICIALES = [
  { id: 'venta-001', cliente: 'Juan', fecha: '2026-09-02', producto: 'Tornillo autoperforante 1"', valor: 50000, cantidad: 2, total: 100000 },
  { id: 'venta-002', cliente: 'Andres', fecha: '2026-09-05', producto: 'Pintura blanca mate 1 galón', valor: 50000, cantidad: 1, total: 50000 },
  { id: 'venta-003', cliente: 'Nicol', fecha: '2026-09-10', producto: 'Cemento gris 50 kg', valor: 60000, cantidad: 3, total: 180000 },
  { id: 'venta-004', cliente: 'Alejandro', fecha: '2026-09-15', producto: 'Guantes anticorte', valor: 70000, cantidad: 1, total: 70000 },
];

document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(VENTAS_KEY, VENTAS_INICIALES);
  renderizarTabla(Storage.getAll(VENTAS_KEY));
  configurarBuscador();
});

function renderizarTabla(ventas) {
  const tbody = document.querySelector('#tabla-ventas tbody');
  tbody.innerHTML = '';

  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No se encontraron ventas.</td></tr>';
    return;
  }

  ventas.forEach(venta => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${escaparHtml(venta.cliente)}</td>
      <td>${venta.cantidad}</td>
      <td class="celda-flotante">
        ${formatoMoneda(venta.total)}
        <span class="icono-flotante-wrap">
          <a href="nueva-venta.html?id=${encodeURIComponent(venta.id)}"
             class="icono-accion icono-editar"
             title="Editar venta"
             aria-label="Editar venta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button"
                  class="icono-accion icono-eliminar"
                  title="Eliminar venta"
                  aria-label="Eliminar venta"
                  data-id="${escaparHtml(venta.id)}">
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
    boton.addEventListener('click', () => eliminarVenta(boton.dataset.id));
  });
}

function eliminarVenta(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar esta venta?\nEsta acción no se puede deshacer.');
  if (!confirmar) return;

  Storage.removeBy(VENTAS_KEY, 'id', id);

  const input = document.querySelector('#buscador-ventas');
  renderizarTabla(filtrarVentas(input ? input.value : ''));
}

function configurarBuscador() {
  const input = document.querySelector('#buscador-ventas');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarTabla(filtrarVentas(input.value));
  });
}

function filtrarVentas(termino) {
  const todas = Storage.getAll(VENTAS_KEY);
  const buscado = termino.trim().toLowerCase();

  if (buscado === '') return todas;

  return todas.filter(v =>
    v.cliente.toLowerCase().includes(buscado) ||
    v.producto.toLowerCase().includes(buscado)
  );
}
