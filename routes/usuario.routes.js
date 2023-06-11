import { Router } from "express";
import {
  formularioLogin,
  formularioOlvidePassword,
  formularioRegistro,
  registrar,
  confirmarCuenta,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion
} from "../controllers/usuario.controller.js";
const router = Router();

router.route("/login").get(formularioLogin).post(autenticar);

router.route("/registro").get(formularioRegistro).post(registrar);

router
  .route("/olvide-password")
  .get(formularioOlvidePassword)
  .post(resetPassword);

router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

router.get("/confirmar/:token", confirmarCuenta);

router.post('/cerrar-sesion' , cerrarSesion)
export default router;
