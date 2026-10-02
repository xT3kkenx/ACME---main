/**
 * =============================================================================
 * reportes.js
 * -----------------------------------------------------------------------------
 * A diferencia de los demás módulos, reportes.html no tiene su propio
 * localStorage: solo LEE lo que ya existe en Ventas, Compras y Órdenes
 * (acme_ventas, acme_compras, acme_ordenes) y lo muestra resumido.
 *
 * El filtro de fechas (Fecha inicio / Fecha fin) se aplica sobre Ventas y
 * Compras, que sí tienen un campo "fecha". Las Órdenes de trabajo no
 * manejan fecha en este sistema, así que su tabla siempre muestra el
 * total histórico.
 *
 * Las fechas en los <input type="date"> vienen en formato "AAAA-MM-DD",
 * que es justo el mismo formato en que se guardan en localStorage, así
 * que se pueden comparar directamente como texto (ordenan igual que como
 * números) sin necesidad de convertirlas a objetos Date.
 * =============================================================================
 */

const VENTAS_KEY = 'acme_ventas';
const COMPRAS_KEY = 'acme_compras';
const ORDENES_KEY = 'acme_ordenes';

const ETIQUETAS_METODO = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia' };
const ETIQUETAS_ESTADO = { proceso: 'En proceso', terminada: 'Terminada' };

document.addEventListener('DOMContentLoaded', () => {
  renderizarOrdenes(); // no depende del filtro de fechas

  const inputInicio = document.querySelector('#filtro-fecha-inicio');
  const inputFin = document.querySelector('#filtro-fecha-fin');
  const botonLimpiar = document.querySelector('#btn-limpiar-filtro');

  inputInicio.addEventListener('change', aplicarFiltro);
  inputFin.addEventListener('change', aplicarFiltro);
  botonLimpiar.addEventListener('click', () => {
    inputInicio.value = '';
    inputFin.value = '';
    aplicarFiltro();
  });

  aplicarFiltro(); // primera carga: sin fechas seleccionadas, muestra todo
});

/**
 * Lee el rango de fechas elegido, valida que tenga sentido (inicio no
 * puede ser después de fin) y, si todo está bien, vuelve a dibujar las
 * tablas de Ventas y Compras y las tarjetas de resumen.
 */
function aplicarFiltro() {
  const inicio = document.querySelector('#filtro-fecha-inicio').value; // 'AAAA-MM-DD' o ''
  const fin = document.querySelector('#filtro-fecha-fin').value;
  const spanError = document.querySelector('#error-filtro-fecha');

  spanError.textContent = '';

  if (inicio !== '' && fin !== '' && inicio > fin) {
    spanError.textContent = 'La fecha de inicio no puede ser posterior a la fecha final.';
    return;
  }

  const ventasFiltradas = filtrarPorFecha(Storage.getAll(VENTAS_KEY), inicio, fin);
  const comprasFiltradas = filtrarPorFecha(Storage.getAll(COMPRAS_KEY), inicio, fin);

  renderizarVentas(ventasFiltradas);
  renderizarCompras(comprasFiltradas);
  actualizarTarjetas(ventasFiltradas, comprasFiltradas);
}

/**
 * Devuelve solo los registros cuya "fecha" cae dentro de [inicio, fin].
 * Si inicio o fin vienen vacíos, ese extremo del rango no se aplica
 * (por ejemplo, dejar "fin" vacío muestra todo desde "inicio" en adelante).
 */
function filtrarPorFecha(registros, inicio, fin) {
  return registros
    .filter(registro => {
      if (inicio !== '' && registro.fecha < inicio) return false;
      if (fin !== '' && registro.fecha > fin) return false;
      return true;
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function renderizarVentas(ventas) {
  const tbody = document.querySelector('#tabla-resumen-ventas tbody');
  tbody.innerHTML = '';

  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay ventas en el rango de fechas seleccionado.</td></tr>';
    return;
  }

  ventas.forEach(venta => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatoFecha(venta.fecha)}</td>
      <td>${escaparHtml(venta.cliente)}</td>
      <td>${escaparHtml(venta.producto)}</td>
      <td>${venta.cantidad}</td>
      <td>${formatoMoneda(venta.total)}</td>
    `;
    tbody.appendChild(fila);
  });
}

function renderizarCompras(compras) {
  const tbody = document.querySelector('#tabla-resumen-compras tbody');
  tbody.innerHTML = '';

  if (compras.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay compras en el rango de fechas seleccionado.</td></tr>';
    return;
  }

  compras.forEach(compra => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${formatoFecha(compra.fecha)}</td>
      <td>${escaparHtml(compra.proveedor)}</td>
      <td>${escaparHtml(compra.producto)}</td>
      <td>${compra.cantidad}</td>
      <td>${formatoMoneda(compra.total)}</td>
    `;
    tbody.appendChild(fila);
  });
}

// Las órdenes de trabajo no tienen fecha en este sistema, así que su
// tabla se pinta una sola vez con todo el historial (no cambia con el filtro).
function renderizarOrdenes() {
  const tbody = document.querySelector('#tabla-resumen-ordenes tbody');
  const ordenes = Storage.getAll(ORDENES_KEY);
  tbody.innerHTML = '';

  if (ordenes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No hay órdenes de trabajo registradas.</td></tr>';
    return;
  }

  ordenes.forEach(orden => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${escaparHtml(orden.cliente)}</td>
      <td>${escaparHtml(orden.responsable)}</td>
      <td>${ETIQUETAS_METODO[orden.metodo] || escaparHtml(orden.metodo)}</td>
      <td>${formatoMoneda(orden.total)}</td>
      <td>${ETIQUETAS_ESTADO[orden.estado] || escaparHtml(orden.estado)}</td>
    `;
    tbody.appendChild(fila);
  });
}

/**
 * Recalcula las 4 tarjetas de arriba según lo que quedó dentro del rango
 * de fechas filtrado: cuántas unidades se vendieron/compraron, y cuántos
 * clientes/proveedores distintos tuvieron movimientos en ese rango.
 */
function actualizarTarjetas(ventasFiltradas, comprasFiltradas) {
  // "Total productos vendidos" = unidades vendidas (suma de cantidades).
  const totalVendidos = ventasFiltradas.reduce((suma, v) => suma + Number(v.cantidad), 0);

  // "Total compras realizadas" = número de compras registradas (no unidades).
  const totalComprados = comprasFiltradas.length;

  // Set() elimina duplicados automáticamente: así contamos cuántos
  // clientes/proveedores DISTINTOS aparecen en el rango filtrado.
  const clientesActivos = new Set(ventasFiltradas.map(v => v.cliente.toLowerCase())).size;
  const proveedoresActivos = new Set(comprasFiltradas.map(c => c.proveedor.toLowerCase())).size;

  document.querySelector('#tarjeta-vendidos').textContent = totalVendidos;
  document.querySelector('#tarjeta-comprados').textContent = totalComprados;
  document.querySelector('#tarjeta-clientes').textContent = clientesActivos;
  document.querySelector('#tarjeta-proveedores').textContent = proveedoresActivos;
}

// Convierte "2026-09-15" (formato del <input type="date">) en "15/09/2026".
function formatoFecha(fechaIso) {
  if (!fechaIso) return '';
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}
