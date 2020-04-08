import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, Namespace, emit, disconnect
from dotenv import load_dotenv


load_dotenv()
async_mode = None

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', None)
socketio = SocketIO(app, async_mode=async_mode)

data = {}


@app.route('/')
def index():
    return render_template('index.html', async_mode=socketio.async_mode)


class MyNamespace(Namespace):
    def on_log(self, message):
        emit('log', {
            'data': message['data'],
            'id': request.sid,
        })

    def on_message_changed(self, message):
        data[request.sid] = message['data']
        emit('message_changed', {
            'data': message['data'],
            'id': request.sid,
        }, broadcast=True)

    def on_stop_participation(self):
        if request.sid in data:
            del data[request.sid]
            emit('message_removed', {
                'id': request.sid,
            }, broadcast=True)
            emit('log', {
                'data': 'Your message has been deleted',
                'id': request.sid,
            })

    def on_disconnect_request(self):
        extra_msg = ''
        if request.sid in data:
            extra_msg = ' and your message has been deleted'
        emit('log', {
            'data': 'You are disconnected' + extra_msg,
            'id': request.sid,
        })
        disconnect()

    def on_connect(self):
        emit('connection_ok', {
            'data': data,
            'id': request.sid
        })

    def on_disconnect(self):
        if request.sid in data:
            del data[request.sid]
            emit('message_removed', {
                'id': request.sid,
            }, broadcast=True)
        print('\nClient disconnected', request.sid)


socketio.on_namespace(MyNamespace('/test'))


if __name__ == '__main__':
    socketio.run(app, debug=True)
