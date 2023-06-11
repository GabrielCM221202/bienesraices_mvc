import { request, response } from "express";
import {
  Precio,
  Categoria,
  Propiedad,
  Mensaje,
  Usuario,
} from "../models/index.js";
import { validationResult } from "express-validator";
import { unlink } from "node:fs/promises";
import { esVendedor, formatearFecha } from "../helpers/index.js";

const admin = async (req = request, res = response) => {
  // Consultar la pagina de los queryParams
  const { pagina: paginaActual } = req.query;

  const expresion = /^[1-9]$/;

  if (!expresion.test(paginaActual)) {
    return res.redirect("/mis-propiedades?pagina=1");
  }

  try {
    // Consultar la DB para extraer las propiedades del usuario
    const { id } = req.usuario;

    const limit = 6;
    const offset = paginaActual * limit - limit;

    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          usuarioId: id,
        },
        include: [
          { model: Categoria, as: "categoria" },
          { model: Precio, as: "precio" },
          { model: Mensaje, as: "mensajes" },
        ],
      }),

      Propiedad.count({
        where: { usuarioId: id },
      }),
    ]);

    res.render("./propiedades/admin", {
      pagina: "Mis propiedades",
      propiedades,
      csrfToken: req.csrfToken(),
      paginas: Math.ceil(total / limit),
      paginaActual: Number(paginaActual),
      limit,
      offset,
      total,
    });
  } catch (error) {
    console.error(error);
  }
};

const crear = async (req = request, res = response) => {
  // Consultar la tabla de categorias y precios
  try {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);
    res.render("./propiedades/crear", {
      csrfToken: req.csrfToken(),
      pagina: "Crear Propiedad",
      categorias,
      precios,
    });
  } catch (error) {
    console.error(error);
  }
};

const guardar = async (req = request, res = response) => {
  // Validar los campos
  const {
    titulo,
    descripcion,
    categoria: categoriaId,
    precio: precioId,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    lng,
  } = req.body;

  let resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);
    res.render("./propiedades/crear", {
      csrfToken: req.csrfToken(),
      pagina: "Crear Propiedad",
      categorias,
      precios,
      errores: resultado.array(),
      datos: {
        titulo,
        descripcion,
      },
    });
  }

  //En caso de pasar todas las validaciones creamos un registro
  try {
    const propiedadGuardar = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
      usuarioId: req.usuario.id,
      imagen: " ",
    });

    const { id } = propiedadGuardar;
    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.error(error);
  }
};

const agregarImagen = async (req = request, res = response) => {
  // Validar que el id de la propiedad sea correcto
  const { id } = req.params;

  // Buscar la propiedad en la BD
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que la propiedad no este publicada
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que la propiedad pertenece a quien visite la pagina

  const { id: idUsuario } = req.usuario;

  if (idUsuario.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("./propiedades/agregar-imagen", {
    pagina: `Agregar Imagen a la propiedad: ${propiedad.titulo}`,
    propiedad,
    csrfToken: req.csrfToken(),
  });
};

const guardarImagen = async (req = request, res = response, next) => {
  // Validar que el id de la propiedad sea correcto
  const { id } = req.params;

  // Buscar la propiedad en la BD
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que la propiedad no este publicada
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que la propiedad pertenece a quien visite la pagina

  const { id: idUsuario } = req.usuario;

  if (idUsuario.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  // Guardar la imagen
  try {
    // Modificar la propiedad
    propiedad.publicado = true;
    propiedad.imagen = req.file.filename;

    await propiedad.save();
    return next();
  } catch (error) {
    console.error(error);
  }
};

const editar = async (req = request, res = response) => {
  const { id } = req.params;
  const { id: idUsuario } = req.usuario;
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que el usuario sea el mismo que creo la propiedad
  if (propiedad.usuarioId.toString() !== idUsuario.toString()) {
    return res.redirect("/mis-propiedades");
  }

  try {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);
    res.render("./propiedades/editar", {
      csrfToken: req.csrfToken(),
      pagina: `Editar Propiedad: ${propiedad.titulo}`,
      categorias,
      precios,
      datos: propiedad,
    });
  } catch (error) {
    console.error(error);
  }
};

const guardarCambios = async (req = request, res = response) => {
  const { id } = req.params;
  const { id: idUsuario } = req.usuario;
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que el usuario sea el mismo que creo la propiedad
  if (propiedad.usuarioId.toString() !== idUsuario.toString()) {
    return res.redirect("/mis-propiedades");
  }

  const {
    titulo,
    descripcion,
    categoria: categoriaId,
    precio: precioId,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    lng,
  } = req.body;

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("./propiedades/editar", {
      csrfToken: req.csrfToken(),
      pagina: "Editar Propiedad",
      categorias,
      precios,
      errores: resultado.array(),
      datos: {
        titulo,
        descripcion,
      },
    });
  }

  // Actualizar el registro en la base de datos
  try {
    propiedad.set({
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      lng,
      precioId,
      categoriaId,
    });

    await propiedad.save();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.error(error);
  }
};

const eliminar = async (req = request, res = response) => {
  const { id } = req.params;
  const { id: idUsuario } = req.usuario;
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que el usuario sea el mismo que creo la propiedad
  if (propiedad.usuarioId.toString() !== idUsuario.toString()) {
    return res.redirect("/mis-propiedades");
  }

  try {
    // Eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`);
    // Eliminar el registro
    await propiedad.destroy();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.error(error);
  }
};

// Modificar el Estado de la Propiedad

const cambiarEstado = async (req = request , res=response) => {
  const { id } = req.params;
  const { id: idUsuario } = req.usuario;
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que el usuario sea el mismo que creo la propiedad
  if (propiedad.usuarioId.toString() !== idUsuario.toString()) {
    return res.redirect("/mis-propiedades");
  }

  // Actualizar el estado de la propiedad

  propiedad.publicado = !propiedad.publicado;

  await propiedad.save();

  res.json({todo: 'Bien'})
}

// Muestra una propiedad

const mostrarPropiedad = async (req = request, res = response) => {
  // Validar que la propiedad exista

  const { id } = req.params;

  // Buscamos la propiedad en la db

  const propiedad = await Propiedad.findByPk(id, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });

  if (!propiedad || !propiedad.publicado) {
    return res.redirect("/404");
  }
  res.render("./propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    vendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
  });
};

const enviarMensaje = async (req = request, res = response) => {
  // Validar que la propiedad exista

  const { id: propiedadId } = req.params;

  // Buscamos la propiedad en la db

  const propiedad = await Propiedad.findByPk(propiedadId, {
    include: [
      { model: Categoria, as: "categoria" },
      { model: Precio, as: "precio" },
    ],
  });

  if (!propiedad) {
    return res.redirect("/404");
  }

  // Errores de validacion
  let resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    return res.render("./propiedades/mostrar", {
      propiedad,
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      vendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      errores: resultado.array(),
    });
  }

  // Almacenar el mensaje

  const { mensaje } = req.body;
  const { id: usuarioId } = req.usuario;

  await Mensaje.create({
    mensaje,
    propiedadId,
    usuarioId,
  });

  res.redirect("/");
};

const mostrarMensajes = async (req = request, res = response) => {
  const { id } = req.params;
  const { id: idUsuario } = req.usuario;
  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Mensaje,
        as: "mensajes",
        include: [{ model: Usuario.scope('eliminarPassword'), as: "usuario" }],
      },
    ],
  });
  if (!propiedad) {
    return res.redirect("/mis-propiedades");
  }
  // Validar que el usuario sea el mismo que creo la propiedad
  if (propiedad.usuarioId.toString() !== idUsuario.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("./propiedades/mensajes", {
    pagina: "Mensajes",
    mensajes: propiedad.mensajes,
    formatearFecha
  });
};

export {
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
};
