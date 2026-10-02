/**
 * =============================================================================
 * ordenes.js
 * -----------------------------------------------------------------------------
 * Mismo patrón que los módulos anteriores, aplicado a las órdenes de trabajo.
 * El "método de pago" y el "estado" se guardan como valores cortos
 * (efectivo/tarjeta/transferencia, proceso/terminada) y se traducen a un
 * texto más amigable solo al momento de mostrarlos en la tabla.
 * =============================================================================
 */

const ORDENES_KEY = 'acme_ordenes';

const ORDENES_INICIALES = [
  { id: 'ord-001', cliente: 'Juan', responsable: 'Pedro', metodo: 'efectivo', producto: 'Instalación eléctrica', valor: 200000, cantidad: 1, total: 200000, estado: 'proceso' },
  { id: 'ord-002', cliente: 'Andres', responsable: 'Maria', metodo: 'tarjeta', producto: 'Reparación de tubería', valor: 150000, cantidad: 1, total: 150000, estado: 'terminada' },
  { id: 'ord-003', cliente: 'Carlos', responsable: 'Jose', metodo: 'transferencia', producto: 'Pintura de fachada', valor: 300000, cantidad: 1, total: 300000, estado: 'proceso' },
  { id: 'ord-004', cliente: 'Jhoana', responsable: 'Laura', metodo: 'efectivo', producto: 'Mantenimiento general', valor: 120000, cantidad: 1, total: 120000, estado: 'terminada' },
];

// Traducción de los valores guardados a un texto legible para el usuario.
const ETIQUETAS_METODO = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia' };
const ETIQUETAS_ESTADO = { proceso: 'En proceso', terminada: 'Terminada' };

document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(ORDENES_KEY, ORDENES_INICIALES);
  renderizarTabla(Storage.getAll(ORDENES_KEY));
  configurarBuscador();
});

function renderizarTabla(ordenes) {
  const tbody = document.querySelector('#tabla-ordenes tbody');
  tbody.innerHTML = '';

  if (ordenes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No se encontraron órdenes.</td></tr>';
    return;
  }

  ordenes.forEach(orden => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${escaparHtml(orden.cliente)}</td>
      <td>${escaparHtml(orden.responsable)}</td>
      <td>${ETIQUETAS_METODO[orden.metodo] || escaparHtml(orden.metodo)}</td>
      <td>${formatoMoneda(orden.total)}</td>
      <td class="celda-flotante">
        ${ETIQUETAS_ESTADO[orden.estado] || escaparHtml(orden.estado)}
        <span class="icono-flotante-wrap">
          <a href="nueva-orden.html?id=${encodeURIComponent(orden.id)}"
             class="icono-accion icono-editar"
             title="Editar orden"
             aria-label="Editar orden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button"
                  class="icono-accion icono-eliminar"
                  title="Eliminar orden"
                  aria-label="Eliminar orden"
                  data-id="${escaparHtml(orden.id)}">
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
    boton.addEventListener('click', () => eliminarOrden(boton.dataset.id));
  });
}

function eliminarOrden(id) {
  const confirmar = confirm('¿Seguro que deseas eliminar esta orden de trabajo?\nEsta acción no se puede deshacer.');
  if (!confirmar) return;

  Storage.removeBy(ORDENES_KEY, 'id', id);

  const input = document.querySelector('#buscador-ordenes');
  renderizarTabla(filtrarOrdenes(input ? input.value : ''));
}

function configurarBuscador() {
  const input = document.querySelector('#buscador-ordenes');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarTabla(filtrarOrdenes(input.value));
  });
}

function filtrarOrdenes(termino) {
  const todas = Storage.getAll(ORDENES_KEY);
  const buscado = termino.trim().toLowerCase();

  if (buscado === '') return todas;

  return todas.filter(o =>
    o.cliente.toLowerCase().includes(buscado) ||
    o.responsable.toLowerCase().includes(buscado)
  );
}
