

function modificarCantidad(accion,boton) {
    // Encuentra el contenedor de la cantidad correspondiente al botón presionado
    let cantidadProducto = boton.closest('.cantidad').querySelector('.cantidadProducto');
    
    // Obtenemos el valor actual de la cantidad como un número entero
    let cantidad = parseInt(cantidadProducto.textContent); 

    if (accion === "mas") {
        cantidad++; 
    } else if (accion === "menos" && cantidad > 1) {
        cantidad--; 
    }

    cantidadProducto.textContent = cantidad;
}

