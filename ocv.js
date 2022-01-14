var faces = []
var cur_face = 0

// var pics = []
// var pic_labels = []

let labeledFaceDescriptors = []

async function onPlay() {
  const videoEl = $('#inputVideo').get(0)

  if(videoEl.paused || videoEl.ended)
    return setTimeout(() => onPlay())

  inputvid = document.getElementById('inputVideo')
  overlay = document.getElementById('overlay')
  overlay.width = inputvid.videoWidth
  overlay.height = inputvid.videoHeight

  const canvas = $('#overlay').get(0)

  try {
    var ctx = canvas.getContext('2d')

    let face = await faceapi.detectSingleFace(inputvid)
    cur_face = face
  
    if (labeledFaceDescriptors.length == 0) {
      // Render a rectangle over each detected face.
      var box = face.box
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.lineWidth = 2;
    
      ctx.stroke();
    }
    else {
      // const canvas = $('#overlay').get(0);
      const tcanvas = document.createElement('canvas')
      tcanvas.width = canvas.width
      tcanvas.height = canvas.height
      tcanvas.getContext('2d').drawImage(inputvid, 0, 0, tcanvas.width, tcanvas.height);

      const dataURL = tcanvas.toDataURL()
      var img = new Image('image/jpeg');
      img.src = dataURL;
      result = await match_face(img)

      const box = face.box
      const text = result.toString()
      const drawBox = new faceapi.draw.DrawBox(box, { label: text })
      drawBox.draw(canvas)
    }
  }
  catch (err) {
    console.log(err)
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

  console.log('models loaded')
}

async function takePic() {
  var inputvid = document.getElementById('inputVideo');
  const canvas = $('#overlay').get(0);
  canvas.getContext('2d').drawImage(inputvid, 0, 0, canvas.width, canvas.height);

  let dataURL = canvas.toDataURL('image/jpeg');
  // console.log(dataURL)

  var myCanvas = document.createElement('canvas');
  myCanvas.width = cur_face.box.width
  myCanvas.height = cur_face.box.height
  var myContext = myCanvas.getContext('2d')

  var myImage;
  var img = new Image();
      img.src = dataURL;
      img.onload = () => {

        myContext.drawImage(img, cur_face.box.x, cur_face.box.y, cur_face.box.width, cur_face.box.height, 
          0, 0, cur_face.box.width, cur_face.box.height);
        myContext.save();

        // create a new data URL
        myImage = myCanvas.toDataURL();

        // get descriptors and update img store
        faces.push(dataURL)
        document.getElementById('face_chart').innerHTML += '<img class="face" src="'+myImage+'";/>';
      };
}

async function get_descriptors() {
  var label = document.getElementById("fname").value;
  let new_descs = []

  const canvas = $('#overlay').get(0);

  for(const f_url of faces) {

    var img = new Image();
      img.src = f_url;

    let fullFaceDescriptions = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
    // fullFaceDescriptions = await faceapi.resizeResults(fullFaceDescriptions)

    var faceDescriptors = [fullFaceDescriptions.descriptor]
    faceDescriptors = new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
    new_descs.push(faceDescriptors)
  }
  return new_descs
}

async function match_face(face) {
  let fullFaceDescriptions = await faceapi.detectSingleFace(face).withFaceLandmarks().withFaceDescriptor()
  // fullFaceDescriptions = [fullFaceDescriptions.descriptor]
  // fullFaceDescriptions = await faceapi.resizeResults(fullFaceDescriptions)

  const maxDescriptorDistance = 0.6
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance)
  // console.log(faceMatcher)
  const result = await faceMatcher.findBestMatch(fullFaceDescriptions.descriptor)
  // console.log(result)
  // const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))

  return result
}

async function train_and_start() {
  var descriptors = await get_descriptors()
  for (const d of descriptors) {
    labeledFaceDescriptors.push(d)
  }
  faces = []
  console.log(labeledFaceDescriptors)
  document.getElementById('face_chart').innerHTML = ""
}