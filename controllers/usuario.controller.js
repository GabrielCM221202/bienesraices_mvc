import { request, response } from "express";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import { check, validationResult } from "express-validator";
import { generarId, generarJWT } from "../helpers/tokens.js";
import { emailOlvidePassword, emailRegistro } from "../helpers/emails.js";

const formularioLogin = (req = request, res = response) => {
  res.render("./auth/login", {
    pagina: "Iniciar Sesión",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req = request, res = response) => {
  // Validar el email y el password

  await check("email").isEmail().withMessage("Email no valido").run(req);
  await check("password")
    .notEmpty()
    .withMessage("El password es obligatorio")
    .run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    // Hay errores
    return res.render("./auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const {email , password} = req.body;

  // Comprobar si el usuario existe y si tiene la cuenta confirmada
  const usuario = await Usuario.findOne({where : {email}})

  if(!usuario){
    // El usuario no existe mostrar el error
    return res.render('./auth/login' , {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{msg:'No existe ningun usuario registrado con ese Email'}],
    })
  }

  if(!usuario.confirmado){
    // El usuario no existe mostrar el error
    return res.render('./auth/login' , {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{msg:'Tu cuenta no ha sido confirmada'}],
    })
  }
  
  // Comprobar las contraseñas
  if(!usuario.comprobarPassword(password)){
    return res.render('./auth/login' , {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{msg:'El usuario o la contraseña son incorrectos'}],
    })
  }

  //Autenticar al usuario
  const token = generarJWT({id :usuario.id , nombre :usuario.nombre})
  res.cookie('_token' , token , {
    httpOnly:true,
    // secure:true,
    // sameSite:true
  }).redirect('/mis-propiedades')
};

const formularioRegistro = (req = request, res = response) => {
  res.render("./auth/registro", {
    csrfToken: req.csrfToken(),
    pagina: "Crear Cuenta",
  });
};

const registrar = async (req = request, res = response) => {
  //Validar los campos con express validator
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .run(req);
  await check("email").isEmail().withMessage("Email no valido").run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener al menos 6 caracteres")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Los passwords deben ser iguales")
    .run(req);
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Hay errores
    return res.render("./auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }
  //Verificar que no exista un usuario con el mismo email
  const existeUsuario = await Usuario.findOne({
    where: { email: req.body.email },
  });

  if (existeUsuario) {
    return res.render("./auth/registro", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Ya existe un usuario registrado con ese email" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Si no hay errores entonces guardamos el usuario en la db
  const usuario = await Usuario.create({
    nombre: req.body.nombre,
    email: req.body.email,
    password: req.body.password,
    token: generarId(),
  });
  //Enviar Email de registro

  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //Mostrar un mensaje de confirmación
  res.render("./templates/mensaje", {
    pagina: "Confirmar cuenta",
    mensaje: "Hemos enviado un email de confirmacion, presiona en el enlace",
  });
};

//Funcion que comprueba una cuenta
const confirmarCuenta = async (req = request, res = response) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("./auth/confirmar-cuenta", {
      pagina: "Confirmar Cuenta",
      error: true,
      mensaje: "Token no valido, no se encontro ningun usuario con ese token",
    });
  }
  //En caso de que el usuario exista modificamos el token y confirmamos la cuenta
  usuario.token = null;
  usuario.confirmado = true;

  await usuario.save();

  return res.render("./auth/confirmar-cuenta", {
    pagina: "Confirmar Cuenta",
    mensaje: "La cuenta se confirmo correctamente",
  });
};

const formularioOlvidePassword = (req = request, res = response) => {
  res.render("./auth/olvide-password", {
    pagina: "Recupera tu acceso a Bienes Raices",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req = request, res = response) => {
  //Validar el email
  await check("email")
    .notEmpty()
    .withMessage("El Email es obligatorio")
    .run(req);
  await check("email").isEmail().withMessage("Email no valido").run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Hay errores renderizar los errores
    return res.render("./auth/olvide-password", {
      pagina: "Reestablecer Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  //Una vez validado el correo electronico , buscamos un usuario en la DB

  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("./auth/olvide-password", {
      pagina: "Reestablecer Password",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "No existe ningun usuario registrado con ese correo" }],
    });
  }

  //Generar token para el email

  usuario.token = generarId();

  await usuario.save();

  //Enviar en email con las instrucciones

  emailOlvidePassword({
    nombre: usuario.nombre,
    email,
    token: usuario.token,
  });

  //Renderizar el mensaje de confirmacion

  res.render("./templates/mensaje", {
    pagina: "Reestablecer Password",
    mensaje: "Hemos enviado un email con las instrucciones",
  });
};

const comprobarToken = async (req = request, res = response) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("./auth/confirmar-cuenta", {
      pagina: "Confirmar Cuenta",
      mensaje: "Hubo un error al validar tu informacion, intentalo de nuevo",
      error: true,
    });
  }
  //En caso de que el usuario exista entonces mostramos el formulario para reestablecer el password

  res.render("./auth/reset-password", {
    pagina: "Reestablece tu password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req = request, res = response) => {
  //Validar el password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe ser minimo de 6 caracteres")
    .run(req);
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    //Hay errores, entonces los mostramos en la vista
    return res.render("./auth/reset-password", {
      pagina: "Reestablece tu password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }
  //Identificar al usuario
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("./auth/confirmar-cuenta", {
      pagina: "Reestablecer Password",
      mensaje: "Hubo un error al validar tu informacion, intentalo de nuevo",
      error: true,
    });
  }

  //Hashear de nuevo el password
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);

  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;
  await usuario.save();

  return res.render("./auth/confirmar-cuenta", {
    pagina: "Reestablecer Password",
    mensaje: "Password se Guardo correctamente",
  });
};

const cerrarSesion = async (req = request, res = response) => {
  return res.clearCookie('_token').status(200).redirect('/auth/login')
}

export {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrar,
  confirmarCuenta,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion
};
