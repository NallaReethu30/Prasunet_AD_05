const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');
const outputData = document.getElementById('outputData');
const actionButton = document.getElementById('actionButton');

let currentStream;

async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        currentStream = stream;
        video.setAttribute("playsinline", true); // Required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    } catch (err) {
        console.error(err);
    }
}

function tick() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code) {
            outputData.textContent = code.data;
            handleQRCodeData(code.data);
            stopVideo();
        } else {
            requestAnimationFrame(tick);
        }
    } else {
        requestAnimationFrame(tick);
    }
}

function stopVideo() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

function handleQRCodeData(data) {
    actionButton.hidden = false;
    actionButton.onclick = () => {
        if (data.startsWith('http')) {
            window.open(data, '_blank');
        } else {
            alert(`QR Code Content: ${data}`);
        }
    };
}

startVideo();
