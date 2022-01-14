
var face_start = 0
var face_end = 0
var face_size = 0

const pics = []
const pic_labels = []

async function onPlay() {
  const videoEl = $('#inputVideo').get(0)

  if(videoEl.paused || videoEl.ended)
    return setTimeout(() => onPlay())

  const model =  await blazeface.load();
  const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
  const predictions = await model.estimateFaces(videoEl, returnTensors);

  inputvid = document.getElementById('inputVideo')
  overlay = document.getElementById('overlay')
  overlay.width = inputvid.videoWidth
  overlay.height = inputvid.videoHeight
  
  if (predictions.length > 0) {
    for (let i = 0; i < predictions.length; i++) {
        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        face_start = start
        face_end = end
        const size = [end[0] - start[0], end[1] - start[1]];
        face_size = size

        // Render a rectangle over each detected face.
        const canvas = $('#overlay').get(0)
        var ctx = canvas.getContext('2d')
        // const dims = faceapi.matchDimensions(canvas, videoEl, true)
        // faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.rect(start[0], start[1], size[0], size[1]);
        ctx.lineWidth = 2;

        ctx.stroke();
    }
  }
  setTimeout(() => onPlay())
}

async function run() {
  // try to access users webcam and stream the images
  // to the video element
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  const videoEl = $('#inputVideo').get(0)
  videoEl.srcObject = stream

  // load facial recognition models
  const MODEL_URL = './models'

  await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
  await faceapi.loadFaceLandmarkModel(MODEL_URL)
  await faceapi.loadFaceRecognitionModel(MODEL_URL)

  console.log('models loaded?')
}

async function takePic() {
  // get name label
  var name = document.getElementById("fname").value;
  // get video stream
  inputvid = document.getElementById('inputVideo');
  const canvas = $('#overlay').get(0);
  canvas.getContext('2d').drawImage(inputvid, 0, 0, canvas.width, canvas.height);
  // get data URL
  let dataURL = canvas.toDataURL('image/jpeg');
  // crop and send to page
  var myCanvas = document.createElement('canvas');
  myCanvas.width = canvas.width
  myCanvas.height = canvas.height
  var myContext = myCanvas.getContext('2d')

  var myImage;
  var img = new Image();
      img.src = dataURL;
      img.onload = () => {
        myContext.drawImage(img, face_start[0], face_start[1],face_size[0],face_size[1],0,0,face_size[0],face_size[1]);
        // myContext.drawImage(img, 0, 0)
        myContext.save();

        // //create a new data URL
        myImage = myCanvas.toDataURL();
        // myImage = myImage.toDataURL();

        // get descriptors and update img store
        get_descriptors(myCanvas)
        pics.push(myImage)
        pic_labels.push(name)
        document.getElementById('face_chart').innerHTML += '<img class="face" src="'+myImage+'";/>';
      };
}

faces = []
async function get_descriptors(input) {
  let descriptors = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor()
  console.log(descriptors)
}
  
