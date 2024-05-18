let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
};

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Validar si hay campos vacios
    const camposVacios = [mesa, hora].some(campo => campo === '');

    if (camposVacios) {
        //Verificar si la alerta existe
        const alertaExiste = document.querySelector('.invalid-feedback');

        //TODO: function para agregar alertas
        //Se inserta la alerta si no existe
        if (!alertaExiste) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => { // se remueve la alerta a los 3 segundos
                alerta.remove();
            }, 3000);
        }
        return;
    }

    //Asignar datos del formulario al cliente con spreed operator para crear una copia y asignarle los datos
    cliente = { ...cliente, mesa, hora };

    //Ocular Modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    //Mostrar secciones ocultas
    mostrarSecciones();

    //Obtener platillos de la API json-server que creamos
    obtenerPlatillos();

}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(platillos => mostrarPlatillos(platillos))
        .catch(error => console.log('Error en consulta: ' + error));
}

//Mostar lista de platillos en su respectiva seccion
function mostrarPlatillos(platillos) {

    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach(platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        //TODO: function para agregar elementos
        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number',
            inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //Función que detecta la cantidad y el platillo que se está agregando
        inputCantidad.onchange = function () {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({ ...platillo, cantidad }); // se manda un objeto con la copia del platillo y la cantidad
        }

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);
        contenido.appendChild(row);
    });

}

function agregarPlatillo(producto) {

    //Extraer el pedido actual
    let { pedido } = cliente;

    //Revisar que la antidad sea mayor a 0
    if (producto.cantidad > 0) {
        const existePedido = pedido.find(item => item.id === producto.id); //valida si el item ya existe en el pedido

        if (existePedido) { // si ya existe se actualiza la cantidad
            existePedido.cantidad = producto.cantidad;
        } else {
            cliente.pedido = [...pedido, producto];
        }
    } else { // si la cantidad del producto es cero y esta en el pedido se elimina
        const nuevoResultado = cliente.pedido.filter(item => item.id !== producto.id);
        cliente.pedido = [...nuevoResultado];
    }

    limpiarHTML();

    if(cliente.pedido.length) actualizarResumen(); //Mostrar el resumen
    else mensajePedidoVacio(); // si no hay items en el pedido se muestra el mensaje de pedido vacio
    
}

function actualizarResumen() {

    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    //Información de la mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Información de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    // Titulo de la seccióm
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array de pedidos
    const grupoListaPedido = mostrarInformacionPedido();

    //Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Agregar a la seccion de resumen
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);
    resumen.appendChild(grupoListaPedido);

    contenido.appendChild(resumen);
}

function mostrarInformacionPedido() {

    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach(articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        //Nombre item pedido
        const nombrElement = document.createElement('H4');
        nombrElement.classList.add('my-4');
        nombrElement.textContent = nombre;

        //Cantidad del item
        const cantidadElement = document.createElement('P');
        cantidadElement.classList.add('fw-bold');
        cantidadElement.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //Precio del item
        const precioElement = document.createElement('P');
        precioElement.classList.add('fw-bold');
        precioElement.textContent = 'Precio: $';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = precio;

        //Precio del item
        const subTotalElement = document.createElement('P');
        subTotalElement.classList.add('fw-bold');
        subTotalElement.textContent = 'Subtotal: ';

        const subTotalValor = document.createElement('SPAN');
        subTotalValor.classList.add('fw-normal');
        subTotalValor.textContent = calcularSubTotal(precio, cantidad);

        // Boton para eliminar items del pedido
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        //Funcion para eliminar item del pedido
        btnEliminar.onclick = () => eliminarItemPedido(id);

        //Agregar valores a sus contenedores
        cantidadElement.appendChild(cantidadValor);
        precioElement.appendChild(precioValor);
        subTotalElement.appendChild(subTotalValor);

        //Agregar elementos al LI
        lista.appendChild(nombrElement);
        lista.appendChild(cantidadElement);
        lista.appendChild(precioElement);
        lista.appendChild(subTotalElement);
        lista.appendChild(btnEliminar);

        //Agregar lista al grupo principal
        grupo.appendChild(lista);
    });

    return grupo;

}

function calcularSubTotal(precio, cantidad) {
    return `$ ${precio * cantidad}`;
}

function limpiarHTML() {

    const contenido = document.querySelector('#resumen .contenido');

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }

}

function eliminarItemPedido(id) {
    const { pedido } = cliente;
    const resultado = pedido.filter(item => item.id !== id);
    cliente.pedido = [...resultado];

    //limpiar el codigo HTML previo
    limpiarHTML();

    //TODO: pasar a funcion
    if(cliente.pedido.length) actualizarResumen(); //Mostrar el resumen
    else mensajePedidoVacio(); // si no hay items en el pedido se muestra el mensaje de pedido vacio

    //Se resetea la cantidad a 0 en el formulario del item eliminado
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;

}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los items del pedido';

    contenido.appendChild(texto);
}