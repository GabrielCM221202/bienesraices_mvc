import { request, response } from "express";
import { Categoria, Precio, Propiedad, Usuario } from "../models/index.js";
const propiedades = async (req=request, res=response) => {
    
    // Consultar la base de datos para traernos las propiedades

    const propiedades = await Propiedad.findAll({
        include:[
            {model:Categoria , as:'categoria'},
            {model:Precio , as:'precio'},
        ]
    })

    res.json(propiedades)
}

export {
    propiedades
}