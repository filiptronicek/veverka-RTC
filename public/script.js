const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer();
const myVideo = document.createElement('video');

myVideo.muted = true;
myVideo.id = "me-vid";

const peers = {};
navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            video.id = "hello-from-the-other-side";
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnected', userId => {
    if (peers[userId]) {
        peers[userId].close();
        console.log(`Trying to remove ${userId}`);
    }
});

myPeer.on('open', id => {
    console.log(`My peer ID is: ${id}`);
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');

    video.id = userId;

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    myPeer.on('close', () => {
        video.remove();
    });

    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    console.log(`creating ${video.id}`);
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}
