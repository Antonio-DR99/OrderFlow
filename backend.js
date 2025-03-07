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
    let cantidadProducto = productoCard.querySelector(".cantidadProducto").textContent.trim();
    
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

    for (let i = 0; i < numeroAlimentos; i++) {
        // Calcular un tiempo aleatorio para cada alimento (30 segundos +/- 10 segundos)
        let tiempoAleatorio = Math.floor(Math.random() * 21) + 20; // entre 20 y 40 segundos
        tiempoTotal += tiempoAleatorio;
    }

    return tiempoTotal; // El tiempo total en segundos
}

function actualizarVistaPedidos() {
    const zonaPedido = document.querySelector(".zonaPedido1");
    const zonaEstado = document.querySelector(".zonaEstado1");

    // Limpiar las zonas antes de volver a renderizar
    zonaPedido.innerHTML = '';
    zonaEstado.innerHTML = '';

    for (let i = 0; i < pedidosPendientes.length; i++) {
        let pedido = pedidosPendientes[i];

        const pedidoElemento = document.createElement('div');
        pedidoElemento.classList.add('pedidoItem');

        // Contenido del pedido
        pedidoElemento.innerHTML = `
            <p><strong>Pedido ID:</strong> ${pedido.id}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <p><strong>Productos:</strong> ${pedido.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ')}</p>
        `;

        const tiempoRestanteElemento = document.createElement('p');

        if (pedido.estado === 'Listo para recoger') {
            tiempoRestanteElemento.textContent = `¡Listo para recoger!`;

            // Botón para recoger pedido
            const botonRecoger = document.createElement('button');
            botonRecoger.textContent = 'Recoger Pedido';
            botonRecoger.classList.add('botonRecoger');
            botonRecoger.onclick = function() {
                recogerPedido(pedido);
            };

            // Agregar todo a la zona de estado
            pedidoElemento.appendChild(tiempoRestanteElemento);
            pedidoElemento.appendChild(botonRecoger);
            zonaEstado.appendChild(pedidoElemento);
        } else {
            if (pedido.estado === 'En proceso') {
                tiempoRestanteElemento.textContent = `Tiempo restante: ${pedido.tiempoRestante.toFixed(1)} segundos`;
            } else if (pedido.estado === 'Retraso') {
                tiempoRestanteElemento.textContent = `Retraso: ${Math.abs(pedido.tiempoRestante).toFixed(1)} segundos`;
            } else {
                tiempoRestanteElemento.textContent = `En espera...`;
            }

            pedidoElemento.appendChild(tiempoRestanteElemento);
            zonaPedido.appendChild(pedidoElemento);
        }
    }
}



// Función para iniciar el temporizador y actualizar el estado del pedido
function iniciarTemporizadorPedido(pedido) {
    if (pedido.estado === "Listo para recoger") return; // No iniciar si ya está listo

    let intervaloId = setInterval(() => {
        let tiempoTranscurrido = (Date.now() - pedido.inicioTiempo) / 1000;
        pedido.tiempoRestante = pedido.tiempoEstimado - tiempoTranscurrido;

        if (pedido.tiempoRestante <= 0) {
            pedido.estado = "Listo para recoger";
            pedido.tiempoRestante = Math.abs(pedido.tiempoRestante); 
            clearInterval(intervaloId);
        }else{
            pedido.estado="En proceso";
        }

        guardarPedidosEnLocalStorage();
        actualizarVistaPedidos();
    }, 10000);
}


// Función que simula la recogida de un pedido
function recogerPedido(pedido) {
    // Eliminar el pedido de la lista de pedidos pendientes
    const index = pedidosPendientes.indexOf(pedido);
    if (index > -1) {
        pedidosPendientes.splice(index, 1);
    }
    guardarPedidosEnLocalStorage();
    // Actualizar la vista después de la recogida
    actualizarVistaPedidos();
}

// Función que se llama cuando se confirma el pedido
function confirmarPedido() {
    if (!pedido.id) {
        pedido.id = generarIdPedido(); // Solo asignar un ID si aún no lo tiene
    }
    let nuevoPedido = {
        id: pedido.id,
        productos: [...pedido.productos],
        estado: "En proceso",
        tiempoEstimado: calcularTiempoEstimado(pedido.productos.length),
        tiempoRestante: 0, 
        inicioTiempo: Date.now() // Guardamos la hora exacta en que se crea el pedido
    };

    nuevoPedido.tiempoRestante = nuevoPedido.tiempoEstimado; // Asignamos correctamente el tiempo restante

    pedidosPendientes.push(nuevoPedido);
    actualizarVistaPedidos();
    iniciarTemporizadorPedido(nuevoPedido);
    guardarPedidosEnLocalStorage();

    pedido.id=null;
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
        console.log("Cargando pedidos desde localStorage..."); // Verificar en consola
        pedidosPendientes = JSON.parse(pedidosGuardados);
        console.log("Pedidos cargados:", pedidosPendientes); // Mostrar pedidos recuperados

        pedidosPendientes.forEach(pedido => {
            let tiempoPasado = (Date.now() - pedido.inicioTiempo) / 1000;
            pedido.tiempoRestante = Math.max(0, pedido.tiempoEstimado - tiempoPasado);

            if (pedido.tiempoRestante <= 0) {
                pedido.estado = "Listo para recoger";
            } else {
                pedido.estado = "En proceso";
                iniciarTemporizadorPedido(pedido);
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
