import Usuario from "./Usuario.js";
import Propiedad from "./Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import Mensaje from './Mensaje.js'

// Establecer una relacion 1:1 propiedad-precio

// Precio.hasOne(Propiedad) o Propiedad.belongsTo(Precio)
Propiedad.belongsTo(Precio)
Propiedad.belongsTo(Categoria)
Propiedad.belongsTo(Usuario)
Propiedad.hasMany(Mensaje, {foreignKey : 'propiedadId' })

Mensaje.belongsTo(Propiedad,{foreignKey :'propiedadId'});
Mensaje.belongsTo(Usuario)

export {
    Usuario,
    Propiedad,
    Precio,
    Categoria,
    Mensaje
}