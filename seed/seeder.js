import {Categoria , Precio , Usuario} from '../models/index.js'
import precios from "./precios.js";
import categorias from "./categorias.js";
import usuarios from './usuarios.js';
import db from "../config/db.js";

// Insertar Categorias en el modelo de categorias y precios en el modelo de precios

const importarDatos = async () => {
    try {
        //Autenticar
        await db.authenticate()
        //Generar las columnas
        await db.sync()
        //Insertar los datos
        await Promise.all([Categoria.bulkCreate(categorias), Precio.bulkCreate(precios), Usuario.bulkCreate(usuarios)])
        
        
        console.log('Datos importados correctamente')
        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

const eliminarDatos = async () => {
    try {
    
        // await Promise.all([
        //     Categoria.destroy({where : {}, truncate:true}),
        //     Precio.destroy({where :{}, truncate:true})
        // ])

        await db.sync({force : true})
    
        console.log('Datos eliminados correctamente')
        process.exit(0)
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

if(process.argv[2] === '-i'){
    importarDatos()
}

if(process.argv[2] === '-e'){
    eliminarDatos()
}