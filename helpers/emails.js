import nodemailer from "nodemailer"

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const {email,nombre, token} = datos;

  await transport.sendMail({
    from:'Bienes Raices',
    to:email,
    subject:'Confirma tu cuenta en BienesRaices',
    text: 'Confirma tu cuenta en BienesRacices',
    html:
    `
      <p>Hola ${nombre}, confirma tu cuenta en BienesRaices</p>
      <p>
        Tu cuenta ya esta lista solo debes confirmarla en el siguiente enlace: 
        <a href="${process.env.BACKEND_URL}/auth/confirmar/${token}">Confirmar cuenta</a>
      </p>

      <p>Si tu no creaste esta cuenta puedes ignorar este correo electronico</p>
    `,
  })
};


const emailOlvidePassword = async  (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const {email,nombre, token} = datos;

  await transport.sendMail({
    from:'Bienes Raices',
    to:email,
    subject:'Reestablece tu password en BienesRaices',
    text: 'Reestablece tu password en BienesRacices',
    html:
    `
      <p>Hola ${nombre}, reestablece tu password en BienesRaices</p>
      <p>
        Tu cuenta ya esta lista solo debes confirmarla en el siguiente enlace: 
        <a href="${process.env.BACKEND_URL}:/auth/olvide-password/${token}">Reestablece tu Password</a>
      </p>

      <p>Si tu no solicitaste reestablecer el password, puedes ignorar este correo electronico</p>
    `,
  })
}

export { emailRegistro, emailOlvidePassword };
