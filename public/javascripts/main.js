let ab2str = require('arraybuffer-to-string');

let socket = io.connect('http://localhost:3000');
let base64String = '';
let canvas = $('#hostScreen')[0];
let ctx = canvas.getContext("2d");

let image = new Image();
image.onload = function() {
  ctx.drawImage(image, 0, 0);
};

window.joinRoom = () => {
    socket.emit('joinRoom', $('#hostId').val());
    $('#hostId').prop('disabled', true);
}
socket.on('err', (data) =>{
    alert(data.message);
    $('#hostId').prop('disabled', false);
});

socket.on('screen', (screenData) => {
    let data = '';
    data = screenData;
    if(data.indexOf('&end') != -1){
        base64String += screenData.replace('&end','');
        image.src = "data:image/png;base64," + base64String;
        base64String = '';
    } else {
        base64String += screenData;
    }
})