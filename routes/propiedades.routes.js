import { Router } from "express";
import { body } from "express-validator";
import {
  admin,
  crear,
  guardar,
  agregarImagen,
  guardarImagen,
  editar,
  guardarCambios,
  eliminar,
  mostrarPropiedad,
  enviarMensaje,
  mostrarMensajes,
  cambiarEstado
} from "../controllers/propiedades.controller.js";
import identificarUsuario from "../middlewares/identificarUsuario.js";
import protegerRuta from "../middlewares/protegerRuta.js";
import uploads from "../middlewares/subirImagen.js";

const router = Router();

// ! Muestra las propiedades
router.route("/mis-propiedades").get([protegerRuta], admin);

// ! Muestra un formulario para crear las propiedades
router.get("/propiedades/crear", [protegerRuta], crear);
// ! Permite el envio del formulario
router.post(
  "/propiedades/crear",
  [
    protegerRuta,
    body("titulo")
      .notEmpty()
      .withMessage("El titulo de la publicación es obligatorio"),
    body("descripcion")
      .notEmpty()
      .withMessage("La descripción de la propiedad es obligatoria")
      .isLength({ max: 200 })
      .withMessage("La descripción es muy larga"),
    body("categoria").isNumeric().withMessage("La categoria es obligatoria"),
    body("precio")
      .isNumeric()
      .withMessage("El precio de la propiedad es obligatorio"),
    body("habitaciones")
      .isNumeric()
      .withMessage("El numero de habitaciones es obligatorio"),
    body("estacionamiento")
      .isNumeric()
      .withMessage("El numero de estacionamientos es obligatorio"),
    body("wc").isNumeric().withMessage("El numero de baños es obligatorio"),
    body("lat").notEmpty().withMessage("Selecciona la ubicación en el mapa"),
  ],
  guardar
);

// !Muestra la vista para subir las imagenes de la propiedad

router.get("/propiedades/agregar-imagen/:id", [protegerRuta], agregarImagen);
router.post(
  "/propiedades/agregar-imagen/:id",
  protegerRuta,
  uploads.single("imagen"),
  guardarImagen
);

// !Editar una propiedad

router.get("/propiedades/editar/:id", [protegerRuta], editar);

router.post("/propiedades/editar/:id", [
  protegerRuta,
  body("titulo")
    .notEmpty()
    .withMessage("El titulo de la publicación es obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripción de la propiedad es obligatoria")
    .isLength({ max: 200 })
    .withMessage("La descripción es muy larga"),
  body("categoria").isNumeric().withMessage("La categoria es obligatoria"),
  body("precio")
    .isNumeric()
    .withMessage("El precio de la propiedad es obligatorio"),
  body("habitaciones")
    .isNumeric()
    .withMessage("El numero de habitaciones es obligatorio"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("El numero de estacionamientos es obligatorio"),
  body("wc").isNumeric().withMessage("El numero de baños es obligatorio"),
  body("lat").notEmpty().withMessage("Selecciona la ubicación en el mapa"),
], guardarCambios);

router.post('/propiedades/eliminar/:id' , [protegerRuta] , eliminar)


// Area publica 
router.get('/propiedad/:id' ,identificarUsuario  ,mostrarPropiedad)
router.post('/propiedad/:id' ,identificarUsuario,[
  body('mensaje')
    .isLength({min:10})
    .withMessage('El mensaje no debe ir vacio o es demasiado corto')
],enviarMensaje)

router.get('/mensajes/:id',protegerRuta , mostrarMensajes)

router.put('/propiedades/:id', protegerRuta ,cambiarEstado)

export default router;
