let ab2str = require('arraybuffer-to-string');

let socket = io.connect('http://localhost:3000');
window.joinRoom = () => {
    socket.emit('joinRoom', $('#hostId').val());
    $('#hostId').prop('disabled', true);
}
socket.on('err', (data) =>{
    alert(data.message);
    $('#hostId').prop('disabled', false);
});

socket.on('screen', (screenData) => {
    $('#hostScreen').attr('src','data:image/png;base64,' + ab2str(screenData, 'base64'));
})