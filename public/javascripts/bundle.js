(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
/**
 * @module arraybuffer-to-string/browser
 */

'use strict'

module.exports = function ArrayBufferToString (buffer, encoding) {
	if (encoding == null) encoding = 'utf8'

	var uint8 = new Uint8Array(buffer)

	if (encoding === 'hex') {
		var out = ''
		for (var i = 0, l = uint8.byteLength; i < l; ++i) {
			out += toHex(uint8[i])
		}
		return out
	}

	if (encoding === 'base64') {
		str = String.fromCharCode.apply(null, uint8)
		return btoa(str)
	}

	if (encoding === 'binary' ||
		encoding === 'latin1' ||
		!global.TextDecoder) {
		str = String.fromCharCode.apply(null, uint8)
		return str
	}


	//TextDecoder way
	if (encoding === 'utf16le') encoding = 'utf-16le'

	var decoder = new TextDecoder(encoding)
	var str = decoder.decode(uint8)
	return str
}


function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
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
},{"arraybuffer-to-string":1}]},{},[2]);
