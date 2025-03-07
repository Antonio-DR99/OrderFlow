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
    "El Ibérico": 4.0,

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
    let tiempoFijo = 0;  // Tiempo real/fijo que tarda el cocinero
    let tiempoEstimado=0;  // Tiempo estimado que se muestra al cliente

    // Iterar sobre los productos
    productos.forEach(producto => {
        // Tiempo fijo: 30 segundos base por producto
        tiempoFijo += 30;

        // Si el producto tiene complementos, añadir tiempo aleatorio al tiempo fijo
        if (producto.complementos && producto.complementos.length > 0) {
            producto.complementos.forEach(() => {
                let tiempoAleatorioComplemento = Math.floor(Math.random() * 10) + 1; // Entre 1 y 10 segundos
                tiempoFijo += tiempoAleatorioComplemento;
            });
        }
    });

    // Calcular el tiempo estimado como tiempoFijo ± 10 segundos
    let variacion = Math.floor(Math.random() * 21) - 10; // Genera un número entre -10 y 10
    tiempoEstimado = tiempoFijo + variacion;

    // Asegurar que el tiempo estimado no sea negativo
    if (tiempoEstimado < 0) tiempoEstimado = 0;

    return { tiempoEstimado, tiempoFijo }; // Retornamos ambos tiempos
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
        if (pedido.estado === "Retraso") {
            pedidoElemento.classList.add('retraso');
        }
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
            botonRecoger.onclick = function () {
                recogerPedido(pedido);
            };
            pedidoElemento.appendChild(tiempoRestanteElemento);
            pedidoElemento.appendChild(botonRecoger);
            zonaEstado.appendChild(pedidoElemento);
        } else if (pedido.estado === 'Retraso') {
            // Verificar si los valores de tiempoReal y tiempoEstimado son números válidos
            const tiempoReal = pedido.tiempoReal;
            const tiempoEstimado = pedido.tiempoEstimado;
            if (isNaN(tiempoReal) || isNaN(tiempoEstimado)) {
                console.log(`Error: Tiempo real o estimado no válido. Pedido ID: ${pedido.id}`);
            } else {
                const retraso = (tiempoReal - tiempoEstimado).toFixed(1);
            }
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

        if (tiempoTranscurrido >= pedido.tiempoFijo) {
            pedido.estado = "Listo para recoger";
            pedido.tiempoRestante = 0;
            clearInterval(intervaloId);
        } else if (tiempoTranscurrido > pedido.tiempoEstimado) {
            pedido.estado = "Retraso";
            pedido.tiempoRestante = pedido.tiempoFijo - tiempoTranscurrido;
        } else {
            pedido.estado = "En proceso";
            pedido.tiempoRestante = pedido.tiempoEstimado - tiempoTranscurrido;
        }

        actualizarVistaPedidos(); // Solo actualiza la vista
        // No guardes aquí, guárdalo solo cuando sea necesario
    }, 1000);

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
        pedido.id = generarIdPedido();
    }

    const tiempos = calcularTiempoEstimado(pedido.productos);

    let nuevoPedido = {
        id: pedido.id,
        productos: [...pedido.productos],
        estado: "En proceso",
        tiempoEstimado: tiempos.tiempoEstimado,
        tiempoFijo: tiempos.tiempoFijo,
        tiempoRestante: tiempos.tiempoEstimado,
        inicioTiempo: Date.now(),
        tiempoReal:0,
    };

    pedidosPendientes.push(nuevoPedido);
    console.log("Pedido confirmado:", nuevoPedido);
    actualizarVistaPedidos();
    iniciarTemporizadorPedido(nuevoPedido);
    guardarPedidosEnLocalStorage();

    // Limpiar tanto el carrito como el panel de selección
    limpiarCarrito();
    limpiarFormulario();
    pedido.id = null; // Reiniciar el ID del pedido actual
    actualizarCarrito(); // Actualizar la vista del carrito
}


function limpiarFormulario() {
    // Limpiar inputs de texto
    const inputsTexto = document.querySelectorAll('input[type="text"]');
    inputsTexto.forEach(input => input.value = "");

    // Reiniciar selects
    const selects = document.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);

    // Desmarcar todos los checkboxes de complementos
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);

    // Reiniciar las cantidades en el panel de selección
    const cantidades = document.querySelectorAll('.cantidadProducto');
    cantidades.forEach(cantidad => cantidad.textContent = "0");
}
function limpiarCarrito() {
    pedido.productos = [];
    pedido.complementos = [];
    pedido.bebidas = [];
    pedido.unidades = {};
    pedido.precioTotal = 0;
    const carritoContainer = document.querySelector(".menuEmergente .productosCarrito");
    carritoContainer.innerHTML = ''; // Limpiar visualmente el carrito
}
function guardarPedidosEnLocalStorage() {
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

            if (tiempoPasado >= pedido.tiempoFijo) {
                pedido.estado = "Listo para recoger";
                pedido.tiempoRestante = 0;
            } else if (tiempoPasado > pedido.tiempoEstimado) {
                pedido.estado = "Retraso";
                pedido.tiempoRestante = pedido.tiempoFijo - tiempoPasado;
                iniciarTemporizadorPedido(pedido);
            } else {
                pedido.estado = "En proceso";
                pedido.tiempoRestante = pedido.tiempoEstimado - tiempoPasado;
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
