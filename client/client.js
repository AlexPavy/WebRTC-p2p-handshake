var localVideo, remoteVideo;
var peerConnection, socket, localStream;
var uuid;

function preparePage() {
    uuid = uuid();

    setVideoElements();

    socket = io.connect('http://localhost:8080');
    socket.on('message', function(message) {
        gotMessageFromServer(message);
    });
    socket.on('dbmessage', function(dbmessage) {
        gotDBMessageFromServer(dbmessage);
    });
    socket.on('user_message', function(user_message) {
        gotUserMessage(user_message);
    });
}

// *** with users database ***

function register() {
    socket.emit('dbmessage',
        JSON.stringify({
            'uuid': uuid,
            "userName" : document.getElementById('userName').value,
            "goal" : "register"
        }));
}

function sendMessage() {
    socket.emit('dbmessage',
        JSON.stringify({
            'uuid': uuid,
            "remoteUserId" : document.getElementById('remoteUserId').value,
            "goal" : "contactUser"
        }));
}

function getUsers() {
    socket.emit('dbmessage',
        JSON.stringify({
            'uuid': uuid,
            "goal" : "getUsers"
        }));
}

function deleteUsers() {
    socket.emit('dbmessage',
        JSON.stringify({
            'uuid': uuid,
            "goal" : "deleteUsers"
        }));
}

function gotDBMessageFromServer(dbmessage) {
    console.log("dbmessage response", dbmessage);
}

function gotUserMessage(user_message) {
    console.log("Message from another user", user_message);
}

// *** webRTC methods ***

var peerConnectionConfig = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
};

var activate = {
    video: true,
    audio: false
};

function setVideoElements() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
}

function startMedia() {
    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(activate).then(getUserMediaSuccess).catch(errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

function getUserMediaSuccess(stream) {
    setVideoElements();
    localStream = stream;
    localVideo.src = window.URL.createObjectURL(stream);
    start(true);
}

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    if(isCaller) {
        peerConnection.createOffer().then(createdDescription).catch(errorHandler);
    }
}

function stop() {
    peerConnection.removeStream(localStream);
    localStream.getVideoTracks()[0].stop();
}

function gotMessageFromServer(message) {
    if(!peerConnection) start(false);

    var signal = JSON.parse(message.data);

    if(signal.uuid == uuid) return;

    if(signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
            // Only create answers in response to offers
            if(signal.sdp.type == 'offer') {
                peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
            }
        }).catch(errorHandler);
    } else if(signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
}

function gotIceCandidate(event) {
    if(event.candidate != null) {
        socket.emit('message', JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
    }
}

function createdDescription(description) {
    console.log('got description');

    peerConnection.setLocalDescription(description).then(function() {
        socket.emit('message', JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
    }).catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.src = window.URL.createObjectURL(event.stream);
}

function errorHandler(error) {
    console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

preparePage();