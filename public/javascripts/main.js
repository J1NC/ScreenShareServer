let ab2str = require('arraybuffer-to-string');

let ws = new WebSocket('ws://10.80.161.110:3100');
let base64String = '';
let canvas = $('#hostScreen')[0];
let ctx = canvas.getContext("2d");

let image = new Image();
image.onload = function() {
  ctx.drawImage(image, 0, 0, 985, 657, 0, 0, 1280, 720);
};

window.joinRoom = () => {
    let req = {event: 'joinRoom', data: $('#hostId').val()}
    ws.send(JSON.stringify(req));
}

ws.onmessage = (response) => {
    let res = JSON.parse(response.data);
    let event = res.event;
    let message = res.message;

    if(event != 'screen' && event != 'headcount')
        alert(message);
    switch(event){
        case 'suc' : 
            $('#hostId').prop('disabled', true);
            break;
        case 'exit' : 
            location.reload();
            break;
        case 'headcount' :
            $('#headCount').html(message + "명이 현재 접속 중 입니다.");
            break;
        case 'screen' :
            if(message.indexOf('&end') != -1){
                base64String += message.replace('&end','');
                image.src = "data:image/png;base64," + base64String;
                base64String = '';
            } else {
                base64String += message;
            }
            break;
    }
}
// socket.on('err', (message) => {
//     alert(message);
// });

// socket.on('suc', (message) => {
//     alert(message);
//     $('#hostId').prop('disabled', true);
// });

// socket.on('screen', (screenData) => {
//     let data = '';
//     data = screenData;
//     if(data.indexOf('&end') != -1){
//         base64String += screenData.replace('&end','');
//         image.src = "data:image/png;base64," + base64String;
//         base64String = '';
//     } else {
//         base64String += screenData;
//     }
// })

// socket.on('exit', (message) => {
//     alert(message);

//     location.reload();
// })

// socket.on('headcount', (data) => {
//     $('#headCount').html(data + "명이 현재 접속 중 입니다.");
// })