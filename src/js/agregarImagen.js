import {Dropzone} from "dropzone"

const token = document.querySelector('meta[name="csrf-token"]').content
console.log(token)

Dropzone.options.imagen= {
    dictDefaultMessage: 'Arrastra tus imagenes AQUÍ',
    acceptedFiles:'.png,.jpg,.jpeg',
    maxFileSize: 5,
    maxFiles:1,
    parallelUploads:1,
    autoProcessQueue:false,
    addRemoveLinks:true,
    dictRemoveFile:'Borrar Archivo',
    dictMaxFilesExceeded: 'No puedes subir mas archivos',
    headers:{
        'CSRF-Token': token
    },
    paramName:'imagen', 
    init:function(){
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', () => {
            dropzone.processQueue();
        })

        dropzone.on('queuecomplete' , () => {
            if(dropzone.getActiveFiles().length == 0){
                window.location.href = '/mis-propiedades'
            }
        })
    }
}