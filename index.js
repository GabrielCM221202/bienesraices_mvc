import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuario.routes.js';
import db from './config/db.js';
import dotenv from 'dotenv'
import propiedadesRoutes from './routes/propiedades.routes.js';
import appRoutes from "./routes/app.routes.js"
import apiRoutes from "./routes/api.routes.js"
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
//Habilitar la lectura de formularios
app.use(express.urlencoded({extended:true}))
//Habilitar cookie parser 
app.use(cookieParser());
app.use(csurf({
    cookie:true
}))
//Conexion a la bbdd
try {
    await db.authenticate();
    await db.sync()
    console.log('Conexion a la DB exitosa');
} catch (error) {
    console.error(error)
}
//Habilitar pug
app.set('view engine' , 'pug');
app.set('views' , './views')

//Routing 
app.use('/auth' , usuarioRoutes)
app.use('/' , propiedadesRoutes)
app.use('/',appRoutes )
app.use('/api' , apiRoutes)
//Habilitar la carpeta publica
app.use(express.static('public'))

app.listen(port , () => {
    console.log(`Servidor corriendo en http://localhost:${port}`)
})