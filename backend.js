//VARIABLES GLOBALES: 
let contadorIdPedido = 1;
let pedidosPendientes=[]
//----------------------

const pedido = {
    productos: [],  
    complementos: [],
    bebidas: [],
    unidades: {},
    precioTotal: 0,
    estado: "Pendiente",
};

const precios = {
    // Productos principales
    "La Rey Burger": 5.5,
    "Fuego Mexicano": 5.5,
    "El Sabor Viajero": 5.5,
    "Choripán": 3.50,
    "SalsiDog": 3.50,
    "Perrito Picante": 3.50,
    "El crujiente": 4.0,
    "El sabroso": 4.0,
    "El iberico": 4.0,

    // Ingredientes adicionales (0.50€ c/u)
    "bacon": 0.50,
    "cebolla caramelizada": 0.50,
    "huevo frito": 0.50,
    "champiñones": 0.50,
    "jalapeños": 0.50,
    "mayonesa especial": 0.50,

    // Complementos
    "Patatas fritas": 2.00,
    "Ensalada": 1.50,
    "Aros de cebolla": 2.50,

    // Bebidas
    "Agua": 1.00,
    "Refresco": 1.50,
    "Cerveza": 2.00
};

function generarIdPedido() {
    return 'pedido' + contadorIdPedido++;
}

// Actualización de la función añadirCarrito para incluir complementos
function añadirCarrito(event) {
    const productoCard = event.target.closest('.producto-card');
    const productoSeleccionado = productoCard.querySelector("h3").textContent.trim();

    // Obtener cantidad seleccionada
    let cantidadProducto = parseInt(productoCard.querySelector(".cantidadProducto").textContent.trim());
    
    if (cantidadProducto>50) {
        return;
    }

    // Obtener complementos seleccionados
    let complementosSeleccionados = [];
    const complementosForm = productoCard.querySelectorAll('input[type="checkbox"]:checked'); 

    for (let i = 0; i < complementosForm.length; i++) {
        complementosSeleccionados.push(complementosForm[i].id); // Añadir el id del complemento al array
    }

    // Calcular el precio de los complementos (0.50€ por complemento)
    let precioComplementos = complementosSeleccionados.length * 0.50;

    if (cantidadProducto > 0) {
        // Verificar si el producto ya está en el carrito
        let productoExistente = pedido.productos.find(producto => producto.nombre === productoSeleccionado);

        if (productoExistente) {
            // Si el producto ya existe, solo actualizamos la cantidad y el precio
            productoExistente.cantidad += cantidadProducto;
            productoExistente.precioUnitario = precios[productoSeleccionado] + precioComplementos; // Actualizamos el precio unitario
            productoExistente.precioTotal = productoExistente.precioUnitario * productoExistente.cantidad; // Calculamos el precio total
        } else {
            // Buscar el precio del producto en la lista de precios
            let precioProducto = precios[productoSeleccionado];
            if (precioProducto !== undefined) {
                // Añadir el producto al carrito con los complementos seleccionados
                pedido.productos.push({
                    nombre: productoSeleccionado,
                    cantidad: cantidadProducto,
                    precioUnitario: precioProducto + precioComplementos, // Precio unitario con complementos
                    precioTotal: (precioProducto + precioComplementos) * cantidadProducto, // Precio total
                    complementos: complementosSeleccionados // Guardar los complementos seleccionados
                });
            } else {
                console.log(`Producto "${productoSeleccionado}" no encontrado en precios.`);
            }
        }
        // Actualizar el carrito visualmente
        actualizarCarrito();
        guardarPedidosEnLocalStorage();
    }
}

// Función para actualizar el carrito visualmente usando un ciclo `for` normal
function actualizarCarrito() {
    const carritoContainer = document.querySelector(".menuEmergente .productosCarrito");
    carritoContainer.innerHTML = ''; // Limpiar el contenedor primero
    let precioTotal = 0;

    for (let i = 0; i < pedido.productos.length; i++) {
        let producto = pedido.productos[i];
        carritoContainer.innerHTML += `
            <div class="productoEnCarrito">
                <p>Producto: ${producto.nombre}</p>
                <p>Cantidad: ${producto.cantidad}</p>
                <p>Precio Unitario: ${producto.precioUnitario}€</p>
                <p>Total: ${producto.precioTotal}€</p>
                <p>Complementos: ${producto.complementos.join(', ') || "Ninguno"}</p>
            </div>
        `;
        precioTotal += producto.precioTotal;
    }
    carritoContainer.innerHTML += `<strong><p>Total: ${precioTotal}€</p></strong>`;
}

// Función para calcular el tiempo estimado basado en el número de productos y sus complementos
function calcularTiempoEstimado(productos) {
    let tiempoEstimado = 0; // Tiempo mostrado al cliente
    let tiempoReal = 0;     // Tiempo real que tarda el cocinero

    // Iterar sobre los productos
    productos.forEach(producto => {
        // Tiempo estimado: 20 segundos por producto (sin complementos)
        tiempoEstimado += 20;
        // Tiempo real: 30 segundos base por producto
        tiempoReal += 30;

        // Si el producto tiene complementos, añadir tiempo aleatorio al tiempo real
        if (producto.complementos && producto.complementos.length > 0) {
            producto.complementos.forEach(() => {
                let tiempoAleatorioComplemento = Math.floor(Math.random() * 10) + 1; // Entre 1 y 10 segundos
                tiempoReal += tiempoAleatorioComplemento;
            });
        }
    });

    return { tiempoEstimado, tiempoReal }; // Retornamos ambos tiempos
}

function actualizarVistaPedidos() {
    const zonaPedido = document.querySelector(".zonaPedido1");
    const zonaEstado = document.querySelector(".zonaEstado1");

    zonaPedido.innerHTML = '';
    zonaEstado.innerHTML = '';

    for (let i = 0; i < pedidosPendientes.length; i++) {
        let pedido = pedidosPendientes[i];
        const pedidoElemento = document.createElement('div');
        pedidoElemento.classList.add('pedidoItem');

        pedidoElemento.innerHTML = `
            <p><strong>Pedido ID:</strong> ${pedido.id}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <p><strong>Productos:</strong> ${pedido.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')}</p>
        `;

        const tiempoRestanteElemento = document.createElement('p');

        if (pedido.estado === 'Listo para recoger') {
            tiempoRestanteElemento.textContent = `¡Listo para recoger!`;
            const botonRecoger = document.createElement('button');
            botonRecoger.textContent = 'Recoger Pedido';
            botonRecoger.classList.add('botonRecoger');
            botonRecoger.onclick = function() {
                recogerPedido(pedido);
            };
            pedidoElemento.appendChild(tiempoRestanteElemento);
            pedidoElemento.appendChild(botonRecoger);
            zonaEstado.appendChild(pedidoElemento);
        } else if (pedido.estado === 'Retraso') {
            const retraso = (pedido.tiempoReal - pedido.tiempoEstimado).toFixed(1);
            tiempoRestanteElemento.textContent = `Retraso: +${retraso} segundos (Faltan ${pedido.tiempoRestante.toFixed(1)} segundos)`;
            pedidoElemento.appendChild(tiempoRestanteElemento);
            zonaPedido.appendChild(pedidoElemento);
        } else if (pedido.estado === 'En proceso') {
            tiempoRestanteElemento.textContent = `Tiempo restante estimado: ${pedido.tiempoRestante.toFixed(1)} segundos`;
            pedidoElemento.appendChild(tiempoRestanteElemento);
            zonaPedido.appendChild(pedidoElemento);
        } else {
            tiempoRestanteElemento.textContent = `En espera...`;
            pedidoElemento.appendChild(tiempoRestanteElemento);
            zonaPedido.appendChild(pedidoElemento);
        }
    }
}



// Función para iniciar el temporizador y actualizar el estado del pedido
function iniciarTemporizadorPedido(pedido) {
    if (pedido.estado === "Listo para recoger") return;

    let intervaloId = setInterval(() => {
        let tiempoTranscurrido = (Date.now() - pedido.inicioTiempo) / 1000;

        if (tiempoTranscurrido >= pedido.tiempoReal) {
            pedido.estado = "Listo para recoger";
            pedido.tiempoRestante = 0;
            clearInterval(intervaloId);
        } else if (tiempoTranscurrido > pedido.tiempoEstimado) {
            pedido.estado = "Retraso";
            pedido.tiempoRestante = pedido.tiempoReal - tiempoTranscurrido;
        } else {
            pedido.estado = "En proceso";
            pedido.tiempoRestante = pedido.tiempoEstimado - tiempoTranscurrido;
        }

        guardarPedidosEnLocalStorage();
        actualizarVistaPedidos();
    }, 1000);

    // Guardar el intervaloId en el pedido para poder detenerlo si es necesario
    pedido.intervaloId = intervaloId;
}


// Función que simula la recogida de un pedido
function recogerPedido(pedido) {
    if (pedido.intervaloId) {
        clearInterval(pedido.intervaloId); // Detener el temporizador si existe
    }
    const index = pedidosPendientes.indexOf(pedido);
    if (index > -1) {
        pedidosPendientes.splice(index, 1);
    }
    guardarPedidosEnLocalStorage();
    actualizarVistaPedidos();
}

// Función que se llama cuando se confirma el pedido
function confirmarPedido() {
    if (!pedido.id) {
        pedido.id = generarIdPedido(); // Solo asignar un ID si aún no lo tiene
    }

    const tiempos = calcularTiempoEstimado(pedido.productos);

    let nuevoPedido = {
        id: pedido.id,
        productos: [...pedido.productos],
        estado: "En proceso",
        tiempoEstimado: tiempos.tiempoEstimado, // Estimación optimista
        tiempoReal: tiempos.tiempoReal,         // Tiempo real del cocinero
        tiempoRestante: tiempos.tiempoEstimado, // Inicialmente el estimado
        inicioTiempo: Date.now()
    };

    nuevoPedido.tiempoRestante = nuevoPedido.tiempoEstimado; // Asignamos correctamente el tiempo restante

    pedidosPendientes.push(nuevoPedido);
    actualizarVistaPedidos();
    iniciarTemporizadorPedido(nuevoPedido);
    guardarPedidosEnLocalStorage();

    pedido.id = null;
    pedido.productos = [];
    actualizarCarrito();
}


function guardarPedidosEnLocalStorage() {
    console.log("Guardando pedidos en localStorage...", pedidosPendientes); // Verificar en consola
    localStorage.setItem("pedidosPendientes", JSON.stringify(pedidosPendientes));
}


function cargarPedidosDesdeLocalStorage() {
    let pedidosGuardados = localStorage.getItem("pedidosPendientes");

    if (pedidosGuardados) {
        console.log("Cargando pedidos desde localStorage...");
        pedidosPendientes = JSON.parse(pedidosGuardados);
        console.log("Pedidos cargados:", pedidosPendientes);

        pedidosPendientes.forEach(pedido => {
            let tiempoPasado = (Date.now() - pedido.inicioTiempo) / 1000;

            if (tiempoPasado >= pedido.tiempoReal) {
                pedido.estado = "Listo para recoger";
                pedido.tiempoRestante = 0;
            } else if (tiempoPasado > pedido.tiempoEstimado) {
                pedido.estado = "Retraso";
                pedido.tiempoRestante = pedido.tiempoReal - tiempoPasado;
                iniciarTemporizadorPedido(pedido); // Reiniciar el temporizador
            } else {
                pedido.estado = "En proceso";
                pedido.tiempoRestante = pedido.tiempoEstimado - tiempoPasado;
                iniciarTemporizadorPedido(pedido); // Reiniciar el temporizador
            }
        });

        actualizarVistaPedidos();
    } else {
        console.log("No hay pedidos en localStorage.");
    }
}


document.addEventListener("DOMContentLoaded", function () {
    cargarPedidosDesdeLocalStorage();
});
