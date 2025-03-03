//VARIABLES GLOBALES: 
let contadorIdPedido = 1;
let pedidosPendientes=[]
//----------------------

const pedido = {
    id: generarIdPedido(),
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
    "patatas fritas": 2.00,
    "ensalada": 1.50,
    "aros de cebolla": 2.50,

    // Bebidas
    "agua": 1.00,
    "refresco": 1.50,
    "cerveza sin alcohol": 2.00
};

function generarIdPedido() {
    return 'pedido' + contadorIdPedido++;
}

// Actualización de la función añadirCarrito para incluir complementos
function añadirCarrito(event) {
    const productoCard = event.target.closest('.producto-card');
    const productoSeleccionado = productoCard.querySelector("h3").textContent.trim();

    // Obtener cantidad seleccionada
    let cantidadProducto = productoCard.querySelector(".cantidadProducto").textContent.trim();
    cantidadProducto = parseInt(cantidadProducto) || 0;

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
    }
}

// Función para actualizar el carrito visualmente usando un ciclo `for` normal
function actualizarCarrito() {
    const carritoContainer = document.querySelector(".menuEmergente .productosCarrito");
    carritoContainer.innerHTML = `<strong><p>Pedido ID: ${pedido.id}</p></strong>`;

    let precioTotal = 0;

    // Usamos un ciclo for normal para iterar sobre los productos del pedido
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
        
        // Acumulamos el precio total
        precioTotal += producto.precioTotal;
    }

    // Mostrar el total final
    carritoContainer.innerHTML += `<strong><p>Total: ${precioTotal}€</p></strong>`;
}

// Función para calcular el tiempo estimado basado en el número de alimentos
function calcularTiempoEstimado(numeroAlimentos) {
    let tiempoTotal = 0;

    // Bucle clásico para calcular el tiempo basado en el número de alimentos
    for (let i = 0; i < numeroAlimentos; i++) {
        // Calcular un tiempo aleatorio para cada alimento (30 segundos +/- 10 segundos)
        let tiempoAleatorio = Math.floor(Math.random() * 21) + 20; // entre 20 y 40 segundos
        tiempoTotal += tiempoAleatorio;
    }

    return tiempoTotal; // El tiempo total en segundos
}

// Función para actualizar la vista de los pedidos en pantalla
function actualizarVistaPedidos() {
    const zonaPedido = document.querySelector(".zonaPedido1");
    const zonaEstado = document.querySelector(".zonaEstado1");

    // Limpiar las zonas antes de volver a renderizar
    zonaPedido.innerHTML = '';
    zonaEstado.innerHTML = '';

    // Iterar sobre todos los pedidos pendientes
    for (let i = 0; i < pedidosPendientes.length; i++) {
        let pedido = pedidosPendientes[i];

        // Crear un contenedor para cada pedido
        const pedidoElemento = document.createElement('div');
        pedidoElemento.classList.add('pedidoItem');
        
        // Mostrar la evolución del pedido
        const estadoElemento = document.createElement('p');
        estadoElemento.textContent = `Pedido ID: ${pedido.id} - Estado: ${pedido.estado}`;

        const tiempoRestanteElemento = document.createElement('p');
        if (pedido.estado === 'Listo para recoger') {
            tiempoRestanteElemento.textContent = `Recoger ahora!`;
            // Crear botón para simular recogida
            const botonRecoger = document.createElement('button');
            botonRecoger.textContent = 'Recoger Pedido';
            botonRecoger.onclick = function() {
                recogerPedido(pedido);
            };
            pedidoElemento.appendChild(botonRecoger);
        } else if (pedido.estado === 'En proceso') {
            tiempoRestanteElemento.textContent = `Tiempo restante: ${pedido.tiempoRestante.toFixed(1)} segundos`;
        } else if (pedido.estado === 'Retraso') {
            // Mostrar el retraso si el estado es "Retraso"
            tiempoRestanteElemento.textContent = `Retraso: ${Math.abs(pedido.tiempoRestante).toFixed(1)} segundos`;
        } else {
            tiempoRestanteElemento.textContent = `En espera...`;
        }

        pedidoElemento.appendChild(estadoElemento);
        pedidoElemento.appendChild(tiempoRestanteElemento);

        // Agregar el pedido a la zona de evolución
        zonaPedido.appendChild(pedidoElemento);
    }
}

// Función para iniciar el temporizador y actualizar el estado del pedido
function iniciarTemporizadorPedido(pedido) {
    // Cambia el estado a "En proceso" después de 10 segundos
    setTimeout(function() {
        pedido.estado = "En proceso";
        actualizarVistaPedidos();

        // Inicia el intervalo para actualizar el tiempo restante
        let intervaloId = setInterval(function() {
            let tiempoTranscurrido = (Date.now() - pedido.inicioTiempo) / 1000;
            pedido.tiempoRestante = Math.max(0, pedido.tiempoEstimado - tiempoTranscurrido);

            // Si el pedido ya ha pasado el tiempo estimado, marcar como "Retraso"
            if (tiempoTranscurrido > pedido.tiempoEstimado && pedido.estado !== "Retraso") {
                pedido.estado = "Retraso";
                pedido.tiempoRestante = tiempoTranscurrido - pedido.tiempoEstimado; // Tiempo de retraso
            }

            // Si el pedido está listo para recoger
            if (pedido.tiempoRestante <= 0 && pedido.estado !== "Retraso") {
                pedido.estado = "Listo para recoger";
                clearInterval(intervaloId); // Detener el intervalo
            }

            actualizarVistaPedidos(); // Actualiza la vista de pedidos

        }, 1000); // Actualiza cada 1 segundo
    }, 10000); // Cambia a "En proceso" después de 10 segundos
}

// Función que simula la recogida de un pedido
function recogerPedido(pedido) {
    // Eliminar el pedido de la lista de pedidos pendientes
    const index = pedidosPendientes.indexOf(pedido);
    if (index > -1) {
        pedidosPendientes.splice(index, 1);
    }

    // Actualizar la vista después de la recogida
    actualizarVistaPedidos();
}

// Función que se llama cuando se confirma el pedido
function confirmarPedido() {
    // Crear el nuevo pedido
    let nuevoPedido = {
        id: generarIdPedido(),
        productos: [...pedido.productos],
        estado: "Realizado",
        tiempoEstimado: calcularTiempoEstimado(pedido.productos.length),
        tiempoRestante: 0,
        inicioTiempo: Date.now()
    };

    nuevoPedido.tiempoRestante = nuevoPedido.tiempoEstimado;

    // Agregar el nuevo pedido a los pedidos pendientes
    pedidosPendientes.push(nuevoPedido);
    actualizarVistaPedidos(); // Actualiza la vista de pedidos

    // Iniciar el temporizador para el nuevo pedido
    iniciarTemporizadorPedido(nuevoPedido);

    // Reiniciar el carrito
    pedido.productos = [];
    actualizarCarrito();
}
