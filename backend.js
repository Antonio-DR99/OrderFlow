const pedido={
    id: generarIdPedido(), 
    productoPrincipal:{
        tipo:null, 
        ingredientesBase:[],
        ingredientesExtra:[],

    },
    complementos:[],
    bebidas:[],
    unidades:{},
    precioTotal:0,
    estado:"Pendiente",

    //metodos
    seleccionarProducto(tipo, ingredientesBase){
        this.productoPrincipal.tipo=tipo; 
        this.productoPrincipal.ingredientesBase=ingredientesBase;
        this.productoPrincipal.ingredientesExtra=[]; 
    },

    agregarIngredienteExtra(ingredientes){
        this.productoPrincipal.ingredientesExtra.push(ingredientes); 
    },

    quitarIngredienteExtra(ingrediente){
        this.productoPrincipal.ingredientesExtra=this.productoPrincipal.ingredientesExtra.filter(i => i !== ingrediente);
    },

    agregarComplemento(complemento){
        if (!this.complementos.includes(complemento)) {
            this.complementos.push(complemento);
        }
    },

    seleccionarBebida(bebida) {
        this.bebidas.push(bebida);
    },

    establecerUnidades(producto, cantidad) {
        if (cantidad > 0 && cantidad <= 50) {
            this.unidades[producto] = cantidad;
        } else {
            console.log("Cantidad no permitida (1-50 unidades).");
        }
    },

    calcularTotal(precios) {
        let total = 0;
    
        // Asegurarnos de que 'productoPrincipal' y sus propiedades están bien definidas
        if (this.productoPrincipal && this.productoPrincipal.tipo) {
            total += precios[this.productoPrincipal.tipo] * (this.unidades[this.productoPrincipal.tipo] || 1);
        }
    
        // Asegurarnos de que 'ingredientesExtra' es un array
        if (Array.isArray(this.productoPrincipal.ingredientesExtra)) {
            total += this.productoPrincipal.ingredientesExtra.reduce((acc, ingrediente) => acc + precios[ingrediente], 0);
        }
    
        // Asegurarnos de que 'complementos' es un array
        if (Array.isArray(this.complementos)) {
            total += this.complementos.reduce((acc, complemento) => acc + precios[complemento], 0);
        }
    
        // Asegurarnos de que 'bebidas' es un array
        if (Array.isArray(this.bebidas)) {
            total += this.bebidas.reduce((acc, bebida) => acc + precios[bebida], 0);
        }
    
        // Almacenamos el total calculado en la propiedad 'precioTotal'
        this.precioTotal = total;
    },

    cambiarEstado(nuevoEstado) {
        this.estado = nuevoEstado;
    }
}; 

const precios = {
    // Productos principales
    "hamburguesa": 5.5,
    "perrito caliente": 4.0,
    "bocadillo": 3.5,

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

// Función auxiliar para generar un ID de pedido autoincremental
function generarIdPedido() {
    let ultimoId = localStorage.getItem("ultimoPedidoId") || 0;
    ultimoId = parseInt(ultimoId) + 1;
    localStorage.setItem("ultimoPedidoId", ultimoId);
    return ultimoId;
}

function añadirCarrito(event) {
    // Obtener el botón que se hizo clic
    const boton = event.target;
    
    // Encuentra el contenedor de la tarjeta de producto (producto-card)
    const productoCard = boton.closest('.producto-card');
    
    // Si no se encuentra el contenedor, salimos de la función
    if (!productoCard) return;

    // Obtener el nombre del producto y la cantidad seleccionada
    const productoSeleccionado = productoCard.querySelector("h3").textContent;
    const cantidadProducto = productoCard.querySelector(".cantidadProducto");
    const cantidad = parseInt(cantidadProducto.textContent);

    if (cantidad > 0) {
        // Añadir el producto al pedido
        if (productoSeleccionado === "La Rey Burger") {
            pedido.seleccionarProducto("hamburguesa", ["pan", "carne", "queso"]);
            pedido.establecerUnidades("hamburguesa", cantidad);
        } else if (productoSeleccionado === "Fuego Mexicano") {
            pedido.seleccionarProducto("hamburguesa", ["pan", "carne", "queso", "salsa picante"]);
            pedido.establecerUnidades("hamburguesa", cantidad);
        } else if (productoSeleccionado === "El Sabor Viajero") {
            pedido.seleccionarProducto("hamburguesa", ["pan", "carne", "queso", "aguacate"]);
            pedido.establecerUnidades("hamburguesa", cantidad);
        }

        // Calcular el total del pedido después de añadir un producto
        pedido.calcularTotal(precios);
        
        // Actualizar el carrito visualmente
        actualizarCarrito();
    }
}



function actualizarCarrito() {
    const carritoContainer = document.querySelector(".menuEmergente .menuInt");
    carritoContainer.innerHTML = `
        <h2>Carrito</h2>
        <p>Pedido ID: ${pedido.id}</p>
        <p>Producto: ${pedido.productoPrincipal.tipo}</p>
        <p>Cantidad: ${pedido.unidades[pedido.productoPrincipal.tipo]}</p>
        <p>Total: ${pedido.precioTotal}€</p>
    `;
}

function confirmarPedido() {
    pedido.cambiarEstado("Confirmado");
    const zonaDisplay = document.querySelector(".zonaPedido1");
    zonaDisplay.innerHTML = `
        <p>Pedido Confirmado</p>
        <p>ID: ${pedido.id}</p>
        <p>Producto: ${pedido.productoPrincipal.tipo}</p>
        <p>Total: ${pedido.precioTotal}€</p>
    `;
}