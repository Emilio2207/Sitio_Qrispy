var express = require("express");
var router = express.Router();
var novedadesModel = require('../../models/novedadesModel');

var util = require('util');
var cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);

/* GET novedades page. */
router.get("/", async function (req, res, next) {

    //var novedades = await novedadesModel.getNovedades();
    var novedades
    if (req.query.q === undefined) {
      novedades = await novedadesModel.getNovedades();
    } else {
        novedades = await novedadesModel.buscarNovedades(req.query.q);
    }

    novedades = novedades.map(novedad => {
      if (novedad.img_id) {
        const imagen = cloudinary.image(novedad.img_id, {
          width: 50,
          height: 50,
          crop: 'fill'
        });
        return {
          ...novedad, // titulo, subtitulo y cuerpo
          imagen // devuelve la imagen
        }
      } else {
        return {
          ...novedad, // titulo, subtitulo y cuerpo
          imagen: '' // devuelve nada
        }
      }
    });

    res.render('admin/novedades',{
        layout:'admin/layout',
        persona: req.session.nombre, 
        novedades,
        is_search: req.query.q !== undefined,
        q: req.query.q
    });
  });

  /*Para eliminar una novedad*/
  router.get('/eliminar/:id', async (req, res, next) => {
    const id = req.params.id;

    let novedad = await novedadesModel.getNovedadById(id);
    if (novedad.img_id) {
        await (destroy(novedad.img_id));
    }
    
    await novedadesModel.deleteNovedadesById(id);
    res.redirect('/admin/novedades')
    
  }); // cierra get de eliminar

  /*aca vemos vista de agregar.hbs > get*/

  router.get('/agregar', (req, res, next) => {
    res.render('admin/agregar', { // agregar.hbs (dentro del admin)
      layout: 'admin/layout'
    }) // cierra render
  }); // cierra get

  /*insertar la novedad > guarde en la BD y lo muestre en el listado*/

  router.post('/agregar', async (req, res, next) => {
    try{

      var img_id = '';
      if (req.files && Object.keys(req.files).length > 0) {
        imagen = req.files.imagen;
        img_id = (await uploader(imagen.tempFilePath)).public_id;
      }

      if (req.body.titulo != "" && req.body.subtitulo != "" && req.body.cuerpo != 
      "") {
        await novedadesModel.insertNovedades({
          ...req.body, //spread titulo, subtitulo y cuerpo
          img_id
        });
        res.redirect('/admin/novedades')
      } else {
        res.render('admin/agregar', {
          layout: 'admin/layout',
          error: true,
          message: 'Todos los campos son requeridos'
        })
      }
    } catch (error) {
      console.log(error)
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: 'No se cargo la novedad'
      })
    }
  })

  router.get('/modificar/:id', async (req, res, next) => {
    var id = req.params.id;
    var novedad = await novedadesModel.getNovedadById(id);
    res.render('admin/modificar', {
      layout: 'admin/layout',
      novedad
    });
  }); // cierro get modif

  /*metodo post - info que viene del formulario > actualiza*/
  router.post('/modificar', async (req, res, next) => {
    try {
        let img_id = req.body.img_original;
        let borrar_img_vieja = false;

        if (req.body.img_delete === "1") {
          img_id = null;
          borrar_img_vieja = true;
        } else {
          if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.tempFilePath)).public_id;
            borrar_img_vieja = true;
          }
        }
        if (borrar_img_vieja && req.body.img_original) {
          await (destroy(req.body.img_original));
        }

      // console.log(req.body.id); // para ver si trae id
      var obj = {
        titulo: req.body.titulo,
        subtitulo: req.body.subtitulo,
        cuerpo: req.body.cuerpo,
        img_id
      }

      console.log(obj) // para ver si trae los datos
      await novedadesModel.modificarNovedadById(obj, req.body.id);
      res.redirect('/admin/novedades');
    } catch (error) {
      console.log(error)
      res.render('admin/modificar', {
        layout: 'admin/layout',
        error: true,
        message: 'No se modifico la novedad'
      })
    } // cierro catch
  }); // cierro el post

  module.exports = router;