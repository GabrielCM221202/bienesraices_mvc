import { Router } from "express";
import { inicio, categoria ,noEncontrado, buscador } from "../controllers/app.controller.js";
const router = Router();

router.get('/' , inicio);

router.get('/categorias/:id' , categoria);

router.get('/404' , noEncontrado);

router.post('/buscador' , buscador)

export default router;