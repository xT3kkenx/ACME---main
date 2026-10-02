/**
 * =============================================================================
 * storage.js
 * -----------------------------------------------------------------------------
 * Módulo genérico para trabajar con colecciones de datos guardadas en
 * localStorage. No es específico de "Productos": lo vamos a reutilizar más
 * adelante para Clientes, Proveedores, Órdenes, Ventas y Compras, por eso
 * vive en su propio archivo dentro de /js.
 *
 * Cada colección se guarda como UN arreglo de objetos bajo una sola llave
 * (key) de localStorage. Ejemplo: la llave "acme_productos" guarda algo como
 * [{codigo: "FER-001", nombre: "...", ...}, {codigo: "PIN-001", ...}, ...]
 *
 * localStorage solo puede guardar texto, por eso siempre convertimos con
 * JSON.stringify() al guardar y con JSON.parse() al leer.
 * =============================================================================
 */

const Storage = {

  /**
   * Devuelve todos los elementos guardados bajo una llave.
   * Si todavía no existe nada guardado, devuelve un arreglo vacío en vez
   * de "null", para que el resto del código no tenga que estar
   * preguntando todo el tiempo si hay datos o no.
   */
  getAll(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Sobrescribe por completo la colección guardada bajo una llave.
   * Todas las demás funciones (add, updateBy, removeBy) terminan usando
   * este método para guardar el resultado final.
   */
  saveAll(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
  },

  /**
   * Agrega un elemento nuevo al final de la colección.
   */
  add(key, item) {
    const items = this.getAll(key);
    items.push(item);
    this.saveAll(key, items);
  },

  /**
   * Busca UN elemento cuyo campo "field" sea igual a "value".
   * Ejemplo: Storage.findBy('acme_productos', 'codigo', 'FER-001')
   * Devuelve undefined si no lo encuentra.
   */
  findBy(key, field, value) {
    const items = this.getAll(key);
    return items.find(item => item[field] === value);
  },

  /**
   * Actualiza (fusiona) los datos del elemento cuyo campo "field" sea
   * igual a "value". Devuelve true si encontró y actualizó algo, o
   * false si no existía ningún elemento con ese valor.
   */
  updateBy(key, field, value, newData) {
    const items = this.getAll(key);
    const index = items.findIndex(item => item[field] === value);

    if (index === -1) return false;

    items[index] = { ...items[index], ...newData };
    this.saveAll(key, items);
    return true;
  },

  /**
   * Elimina el elemento cuyo campo "field" sea igual a "value".
   */
  removeBy(key, field, value) {
    const items = this.getAll(key);
    const filtrados = items.filter(item => item[field] !== value);
    this.saveAll(key, filtrados);
  },

  /**
   * Si la colección aún NO existe en localStorage (primera vez que se
   * abre el sitio en ese navegador), la crea con unos datos iniciales.
   * Así la tabla no aparece vacía la primera vez, pero después de la
   * primera carga todo lo que se ve en pantalla ya viene 100% de
   * localStorage (se puede editar, borrar, agregar, recargar la página,
   * cerrar el navegador, etc. y los datos persisten).
   */
  seedIfEmpty(key, initialData) {
    if (localStorage.getItem(key) === null) {
      this.saveAll(key, initialData);
    }
  }
};
