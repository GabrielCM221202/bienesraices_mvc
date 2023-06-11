import sequelize from "sequelize";
import dotenv from "dotenv"
dotenv.config({path:'.env'})

const db = new sequelize(process.env.BD_NOMBRE,process.env.BD_USUARIO, process.env.BD_CONTRASENIA, {
    host:process.env.BD_HOST,
    port:process.env.BD_PORT || 3306,
    dialect:'mysql',
    define:{
        timestamps:true,
    },
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    },
    operatorAliases:false
});

export default db;
