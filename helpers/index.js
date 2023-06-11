
const esVendedor = (usuarioId, propiedadUsuarioId ) => {
    return usuarioId === propiedadUsuarioId
}

const formatearFecha = (fecha) =>{
    return new Date(fecha).toLocaleDateString('ES',{
        weekday:'long',
        day:"numeric",
        month:"long",
        year:"numeric"
    })
}
export {
    esVendedor,
    formatearFecha
}