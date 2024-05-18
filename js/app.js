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

    //Mostrar el resumen
    actualizarResumen();
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

    //Agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Agregar a la seccion de resumen
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(heading);

    contenido.appendChild(resumen);
}

function limpiarHTML() {

    const contenido = document.querySelector('#resumen .contenido');

    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }

}