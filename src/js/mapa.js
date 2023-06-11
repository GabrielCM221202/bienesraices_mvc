(function() {
    // @19.352109,-99.0975432
    const lat = 19.351795859015464;
    const lng = -99.09852182059325;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    const geocodeService = L.esri.Geocoding.geocodeService()

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Poner el PIN

    marker= new L.marker([lat , lng] , {
        draggable: true , 
        autoPan: true
    }).addTo(mapa)

    marker.on('moveend' , function(e){
        marker = e.target

        
        const posicion = marker.getLatLng();
        console.log(posicion)
        mapa.panTo(new L.LatLng(posicion.lat , posicion.lng))

        //Obtener el nombre de la calle
        geocodeService.reverse().latlng(posicion , 13).run(function(error , resultado) {
            console.log(resultado)
            marker.bindPopup(resultado.address.LongLabel)
            // Llenar los campos con los datos de la calle
            document.querySelector('.calle').textContent = resultado.address?.Address ?? '';

            document.getElementById('calle').value = resultado.address?.Address ?? '';
            document.getElementById('lat').value =resultado.latlng?.lat ?? '';
            document.getElementById('lng').value = resultado.latlng?.lng ?? '';
        })



    })

})()