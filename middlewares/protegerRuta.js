import { request, response } from "express";
import  jwt  from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const protegerRuta = async (req = request, res = response, next) => {
  //Si no existe el token redireccionamos al usuario al login
  const token = req.cookies._token;
  if (!token) {
    return res.redirect("/auth/login");
  }

  // Comprobar el token
  try {
    const decoded = jwt.verify(token , process.env.JWT_SECRET)
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);
    
    // Mandar el error si no existe el usuario

    if(usuario){
        // Guardar al usuario en la request

        req.usuario = usuario;
    }else{
        return res.redirect('/auth/login')
    }
    return next();
  } catch (error) {
    return res.clearCookie('_token').redirect('/auth/login')
  }
  next();
};

export default protegerRuta;
