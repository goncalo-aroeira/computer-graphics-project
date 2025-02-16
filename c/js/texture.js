var scene, camera, renderer;
var textureSize = 512; // Size of the texture
var fieldTexture, skyTexture;
var fieldMaterial, skyMaterial;
var currentTextureType;



init();
animate();

function init() {
  // Create a scene
  scene = new THREE.Scene();

  // Create a camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Create a renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create the field texture and material
  fieldTexture = createFieldTexture();
  fieldMaterial = new THREE.MeshBasicMaterial({ map: fieldTexture });

  // Create the sky texture and material
  skyTexture = createSkyTexture();
  skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });

  // Create a mesh for the field
  var fieldGeometry = new THREE.PlaneGeometry(10, 10);
  var fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
  scene.add(fieldMesh);

  // Create a mesh for the sky
  var skyGeometry = new THREE.PlaneGeometry(10, 10);
  var skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.position.z = -1;
  scene.add(skyMesh);

  // Set the initial texture type to field
  currentTextureType = 'field';

  // Add key event listeners
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onWindowResize);
}

function animate() {
  requestAnimationFrame(animate);


  renderer.render(scene, camera);
}

function createFieldTexture() {
  var canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  var context = canvas.getContext('2d');

  // Draw the background color
  context.fillStyle = '#96FF7C';
  context.fillRect(0, 0, textureSize, textureSize);

  // Draw the circles
  var colors = ['#ffffff', '#ffff00', '#c8a2c8', '#add8e6'];
  var circleRadius = 1;
  var numCircles = 600;
  for (var i = 0; i < numCircles; i++) {
    var x = Math.random() * textureSize;
    var y = Math.random() * textureSize;
    var color = colors[Math.floor(Math.random() * colors.length)];
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, circleRadius, 0, 2 * Math.PI);
    context.fill();
  }

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  return texture;
}

function createSkyTexture() {
  var canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  var context = canvas.getContext('2d');

  // Create the gradient background
  var gradient = context.createLinearGradient(0, 0, 0, textureSize);
  gradient.addColorStop(0, '#00008r'); // Dark blue
  gradient.addColorStop(1, '#9400d3'); // Dark violet
  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  // Draw the stars
  var starRadius = 1;
  var numStars = 600;
  for (var i = 0; i < numStars; i++) {
    var x = Math.random() * textureSize;
    var y = Math.random() * textureSize;
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(x, y, starRadius, 0, 2 * Math.PI);
    context.fill();
  }

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  return texture;
}

function onKeyDown(event) {
    if (event.key === '1') {
      // Switch to field texture
      fieldTexture = createFieldTexture();
      currentTextureType = 'field';
      scene.children[0].material.map = fieldTexture;
    } else if (event.key === '2') {
      // Switch to sky texture
      skyTexture = createSkyTexture();
      currentTextureType = 'sky';
      scene.children[0].material.map = skyTexture;
    } else if (event.key === 's' || event.key === 'S') {
      // Save the current texture as an image file
      saveTexture();
    }
  }
  
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  function saveTexture() {
    var textureToSave;
    if (currentTextureType === 'field') {
      textureToSave = fieldTexture;
    } else if (currentTextureType === 'sky') {
      textureToSave = skyTexture;
    }
  
    // Create a temporary link element to trigger the download
    var link = document.createElement('a');
    link.href = textureToSave.image.toDataURL();
    link.download = currentTextureType + '.png';
    link.click();
  }

  
  
  
  
  