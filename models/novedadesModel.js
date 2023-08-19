const pool = require('./bd');

/*sirve para listar las novedades*/
async function getNovedades() {
    var query = 'select * from novedades';
    var rows = await pool.query(query);
    return rows;
}

async function deleteNovedadesById(id) {
    var query = 'delete from novedades where id = ?';
    var rows = await pool.query(query, [id]);
    return rows;
}

async function insertNovedades(obj) {
    try {
        var query = "insert into novedades set ?";
        var rows = await pool.query(query, [obj])
        return rows;

    } catch (error) {
        console.log(error);
        throw error;
    } // cierra catch
} // cierra insert

/*para modificar que me traiga una sola novedad por id */
async function getNovedadById(id) {
    var query = "select * from novedades where id=? ";
    var rows = await pool.query(query, [id]);
    return rows[0];
}

/*para modificar > que actualice esos campos por el id*/
async function modificarNovedadById(obj, id) {
    try {
        var query = "update novedades set ? where id=? ";
        var rows = await pool.query(query, [obj, id]);
        return rows;
    } catch (error) {
        throw error;
    }
} // cierra modi > update

async function buscarNovedades(busqueda) {
    var query = "select * from novedades where titulo like ? OR subtitulo like ? OR cuerpo like ?";
    var rows = await pool.query(query, ['%' + busqueda + '%', '%' + busqueda + '%', '%' + busqueda + '%']);
    return rows;
}

module.exports = {getNovedades, deleteNovedadesById, insertNovedades, 
getNovedadById, modificarNovedadById, buscarNovedades}