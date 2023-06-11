import { Router } from "express";
import { propiedades } from "../controllers/api.controller.js";
const router = Router();

router.get('/propiedades' , propiedades)


export default router;