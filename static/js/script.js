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

    document.getElementById('participate').onclick = participate;
    document.getElementById('goto').onclick = goto_self;

    // Handlers for the different forms in the page.
    document.getElementById('broadcast').onsubmit = emit_message;
    document.getElementById('broadcast2').onsubmit = emit_message;

    document.querySelector('#stop').onclick = () => {
        socket.emit('stop_participation');
        document.getElementById('stop').classList.add('hidden');
        document.getElementById('goto').classList.add('hidden');
        document.getElementById('participate').focus();
        return false;
    };

    // document.querySelector('form#disconnect').onsubmit = () => {
    //     socket.emit('disconnect_request');
    //     return false;
    // };

    function emit_message(e) {
        let input = e.target.querySelector('textarea') || e.target.querySelector('input');
        let msg = input.value.trim();
        if (msg != ''){
            socket.emit('message_changed', {data: msg});
            document.getElementById('stop').classList.remove('hidden');
            document.getElementById('goto').classList.remove('hidden');
        } else {
            e.stopImmediatePropagation()
        }
        return false;
    }
};


// ╭───────────────────────────╮
// │ SOCKET RESPONSES HANDLERS │
// ╰───────────────────────────╯

function on_connection_ok(rsp) {
    let container = document.getElementById('manif');
    for (let id in rsp.data) {
        let elem = add_new_message(id, rsp.data[id]);
        container.appendChild(elem);
    }
    // reference self id in dataset
    container.dataset.self = rsp.id;
}

function on_message_changed(rsp) {
    let elem = document.getElementById('p' + rsp.id);
    if (!elem) {
        elem = add_new_message(rsp.id, rsp.data);
        document.getElementById('manif').appendChild(elem);
    } else {
        modify_message(elem, rsp.data);
    }
}

function on_message_removed(rsp) {
    let elem = document.getElementById('p' + rsp.id);
    if (elem) {
        elem.parentElement.removeChild(elem);
    }
}

function on_log(rsp) {
    let p = document.createElement('p');
    p.textContent = 'Connected as: ' + rsp.id.substring(0, 5)
        + ' / log: ' + rsp.data;
    document.getElementById('log').appendChild(p);
}

// ╭──────────────────╮
// │ MESSAGES HELPERS │
// ╰──────────────────╯

function add_new_message(id, msg) {
    let elem = document.createElement('DIV');
    elem.id = 'p' + id;
    modify_message(elem, msg);
    return elem;
}

function modify_message(elem, msg) {
    if (is_single_emoji(msg)) {
        elem.classList.remove('slogan');
        elem.textContent = msg;
    } else {
        elem.classList.add('slogan');
        if (elem.firstElementChild) {
            elem.firstElementChild.textContent = msg;
        } else {
            let p = document.createElement('P');
            p.textContent = msg;
            if (elem.firstChild) {
                elem.replaceChild(p, elem.firstChild)
            } else {
                elem.appendChild(p);
            }
        }
    }
}

// ╭────╮
// │ UI │
// ╰────╯

function participate() {
    let dialog = document.getElementById('form-container');
    let sub = dialog.parentElement;
    let form = document.getElementById('broadcast');
    let form2 = document.getElementById('broadcast2');
    let emoji_input = document.getElementById('emoji');
    let lastFocus = dialog.querySelector('input');

    var pre_div = document.createElement('div');
    sub.insertBefore(pre_div, dialog);
    pre_div.tabIndex = 0;
    var post_div = document.createElement('div');
    sub.append(post_div);
    post_div.tabIndex = 0;

    sub.classList.toggle('hidden');
    lastFocus.focus()


    emoji_input.addEventListener('input', check_emoji_input, false);
    document.addEventListener('focus', trap_focus, true);
    document.addEventListener('keyup', on_keyup, false);
    document.addEventListener('click', on_click, true);
    form.addEventListener('submit', close, false);
    form2.addEventListener('submit', close, false);

    function check_emoji_input() {
        if (is_single_emoji(emoji_input.value)) {
            emoji_input.setCustomValidity('');
        } else {
            emoji_input.setCustomValidity('Veuillez entrer un seul émoji');
        }
    }

    function trap_focus(e) {
        if (!dialog.contains(e.target)) {
            let first_elem = dialog.querySelector('input');
            if (lastFocus == first_elem) {
                lastFocus = dialog.querySelector('#broadcast2 input');
            } else {
                lastFocus = first_elem;
            }
            lastFocus.focus()
        } else {
            lastFocus = e.target;
        }
    }

    function on_keyup(e) {
        if (e.key == 'Escape') {
            close();
        }
    }

    function on_click(e) {
        if (!dialog.contains(e.target)) {
            close();
        }
    }

    function close() {
        sub.removeChild(pre_div);
        sub.removeChild(post_div)
        sub.classList.toggle('hidden');
        document.removeEventListener('focus', trap_focus, true);
        document.removeEventListener('keyup', on_keyup, false);
        document.removeEventListener('click', on_click, true);
        form.removeEventListener('submit', close, false);
        form2.removeEventListener('submit', close, false);
        emoji_input.removeEventListener('input', check_emoji_input, false);
        document.getElementById('participate').focus();
    }
}

function goto_self() {
    let self_id = document.getElementById('manif').dataset.self;
    document.getElementById('p' + self_id).scrollIntoView();
}


// ╭───────╮
// │ UTILS │
// ╰───────╯

function is_single_emoji(msg) {
    let match = msg.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/);
    // Checks if the message's content includes a single emoji
    if (match && match[0] === msg) {
        return true;
    }
    return false;
}
