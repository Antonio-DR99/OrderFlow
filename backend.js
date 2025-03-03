//VARIABLES GLOBALES: 
let contadorIdPedido = 1;
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
    "El Crujiente": 4.0,
    "El Sabroso": 4.0,
    "El Iberico": 4.0,

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
    carritoContainer.innerHTML = `<h2>Carrito</h2><p>Pedido ID: ${pedido.id}</p>`;

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
    carritoContainer.innerHTML += `<p>Total: ${precioTotal}€</p>`;
}
