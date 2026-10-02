/**
 * =============================================================================
 * utilidades.js
 * -----------------------------------------------------------------------------
 * Funciones pequeñas de apoyo que se repiten en varios módulos del sistema
 * (Productos, Clientes, Proveedores, Órdenes, Ventas, Compras). Se agrupan
 * aquí para no reescribirlas en cada archivo. Debe cargarse ANTES que
 * cualquier otro script propio de una página (después de storage.js).
 * =============================================================================
 */

/**
 * Genera un identificador único y corto para usar como "llave" interna de
 * un registro (clientes, proveedores, órdenes, ventas, compras...). No se
 * muestra al usuario, solo sirve para que Editar/Eliminar sepan a cuál
 * registro exacto se refieren, aunque dos registros tengan el mismo nombre.
 */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Convierte caracteres especiales de HTML (<, >, &, etc.) en su versión
 * segura antes de insertarlos con innerHTML, para evitar que un dato con
 * símbolos raros rompa la tabla o inyecte HTML.
 */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto === undefined || texto === null ? '' : texto;
  return div.innerHTML;
}

// Números con decimales (para precios): acepta enteros o con punto decimal.
function esNumeroValido(texto) {
  return /^\d+(\.\d+)?$/.test(texto);
}

// Números enteros (para cantidades): solo dígitos, sin decimales.
function esEnteroValido(texto) {
  return /^\d+$/.test(texto);
}

// Formato básico de correo electrónico: algo@algo.algo
function esCorreoValido(texto) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
}

// Teléfonos colombianos: solo dígitos, entre 7 y 10 caracteres.
function esTelefonoValido(texto) {
  return /^\d{7,10}$/.test(texto);
}

/**
 * Da formato de moneda colombiana a un número, ej: 25000 -> "$25.000".
 */
function formatoMoneda(numero) {
  const valor = Number(numero) || 0;
  return '$' + valor.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
