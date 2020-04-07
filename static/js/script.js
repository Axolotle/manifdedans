window.onload = () => {
    // Use a "/test" namespace.
    // An application can open a connection on multiple namespaces, and
    // Socket.IO will multiplex all those connections on a single
    // physical channel. If you don't care about multiple channels, you
    // can set the namespace to an empty string.
    var namespace = '/test';

    // Connect to the Socket.IO server.
    // The connection URL has the following format, relative to the current page:
    //     http[s]://<domain>:<port>[/<namespace>]
    var socket = io(namespace);

    // Event handler for new connections.
    socket.on('connect', function() {
        socket.emit('log', {data: 'I\'m connected!'});
    });

    socket.on('connection_ok', on_connection_ok);
    socket.on('log', on_log);
    socket.on('message_changed', on_message_changed);
    socket.on('message_removed', on_message_removed);

    // Handlers for the different forms in the page.
    document.querySelector('form#emit').onsubmit = () => {
        socket.emit('log', {data: document.querySelector('#emit_data').value});
        return false;
    };
    document.querySelector('form#broadcast').onsubmit = () => {
        socket.emit('message_changed', {data: document.querySelector('#broadcast_data').value});
        return false;
    };
    document.querySelector('form#disconnect').onsubmit = () => {
        socket.emit('disconnect_request');
        return false;
    };
};


// ╭───────────────────────────╮
// │ SOCKET RESPONSES HANDLERS │
// ╰───────────────────────────╯

function on_connection_ok(rsp) {
    let container = document.getElementById('participants');
    for (let id in rsp.data) {
        let elem = document.createElement('p');
        elem.id = 'p' + id;
        elem.textContent = rsp.data[id];
        container.appendChild(elem);
    }
}

function on_log(rsp) {
    let p = document.createElement('p');
    p.textContent = 'Connected as: ' + rsp.id.substring(0, 5)
        + ' / log: ' + rsp.data;
    document.getElementById('log').appendChild(p);
}

function on_message_changed(rsp) {
    let message = document.querySelector('#p' + rsp.id);
    if (!message) {
        message = document.createElement('p');
        message.id = 'p' + rsp.id;
        document.getElementById('participants').appendChild(message);
    }
    message.textContent = rsp.data;
}

function on_message_removed(rsp) {
    let elem = document.querySelector('#p' + rsp.id);
    if (elem) {
        elem.parentElement.removeChild(elem);
    }
}
