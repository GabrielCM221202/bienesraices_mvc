import { request, response } from "express";
import { Sequelize } from "sequelize";
import { Propiedad, Precio, Categoria } from "../models/index.js";

const inicio = async (req = request, res = response) => {
  const [precios, categorias, casas, departamentos] = await Promise.all([
    Precio.findAll(),
    Categoria.findAll(),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 1,
      },
      include: [{ model: Precio, as: "precio" }],
      order: [["createdAt", "DESC"]],
    }),
    Propiedad.findAll({
      limit: 3,
      where: {
        categoriaId: 2,
      },
      include: [{ model: Precio, as: "precio" }],
      order: [["createdAt", "DESC"]],
    }),
  ]);

  res.render("inicio", {
    csrfToken: req.csrfToken(),
    pagina: "Inicio",
    precios,
    categorias,
    casas,
    departamentos,
  });
};

const categoria = async (req = request, res = response) => {
  // Comprobar que la categoria exista

  const { id } = req.params;

  // Hacer la consulta en la base de datos

  const categoria = await Categoria.findByPk(id);

  if (!categoria) {
    return res.redirect("/404");
  }

  // consultar las propiedades de esa categoria

  const propiedades = await Propiedad.findAll({
    where: { categoriaId: id },

    include: [{ model: Precio, as: "precio" }],
  });

  // Mostramos la vista

  res.render("categoria", {
    csrfToken: req.csrfToken(),
    pagina: `${categoria.nombre}s en Venta`,
    propiedades,
  });
};

const noEncontrado = (req = request, res = response) => {
  res.render("404", {
    pagina: "No Encontrada",
    csrfToken: req.csrfToken(),
  });
};

const buscador = async (req = request, res = response) => {
  const { termino } = req.body;

  if (!termino.trim()) {
    return res.redirect("back");
  }

  // Consultar las propiedades

  const propiedades = await Propiedad.findAll({
    where: {
      titulo: {
        [Sequelize.Op.like]: "%" + termino + "%",
      },
    },
    include: [{ model: Precio, as: "precio" }],
  });

    res.render('buscar',{
        pagina:'Resultados de la Busqueda',
        propiedades,
        csrfToken:req.csrfToken()
    })
};

export { inicio, categoria, noEncontrado, buscador };
