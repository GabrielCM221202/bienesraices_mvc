import { request, response } from "express";
import  jwt  from "jsonwebtoken";
import { Usuario } from "../models/index.js";


const identificarUsuario =async (req=request , res=response, next) => {
    
    // Identificar si hay token en las cookies

    const token = req.cookies._token;

    if(!token){
        req.usuario = null;
        return next();
    }

    //comprobar el Token
    
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)

        if(usuario){
            req.usuario = usuario;
        }

        return next()
        
    } catch (error) {
        console.error(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }
    
}

export default identificarUsuario;