import bcrypt from "bcrypt";

const usuarios = [
    {
        nombre:'Gabriel Caballero Monroy',
        email:'gabo22.zuky@gmail.com',
        password: bcrypt.hashSync('123456' , 10),
        confirmado:1
    }
]

export default usuarios;