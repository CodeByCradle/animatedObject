import * as THREE from 'three';
import loadGLB from './load_glb.js'; // Adjust path if necessary

function init() {
  const scene = new THREE.Scene();
  scene.frustumCulled = true;
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });

  let mixer;

  // Set the renderer's clear color to transparent
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 8;

  // Enhanced ambient light for softer shadows
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Increased intensity
  scene.add(ambientLight);

  // Adjusted directional light with a soft shadow
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3); // Increased intensity
  directionalLight.position.set(5, 5, 10); // Adjusted position
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Access the webcam
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true; // Required for mobile devices

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Back camera on mobile
    .then((stream) => {
      video.srcObject = stream;

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.format = THREE.RGBFormat;

      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
      const videoPlaneGeometry = new THREE.PlaneGeometry(16, 9);
      const videoPlane = new THREE.Mesh(videoPlaneGeometry, videoMaterial);
      videoPlane.scale.set(1.5, 1.5, 1.5); // Adjust scale as necessary
      videoPlane.renderOrder = 0; // Ensure this renders first
      videoPlane.position.z = -1; // Move the video plane slightly behind the model
      scene.add(videoPlane);
    })
    .catch((error) => {
      console.error('Error accessing the webcam:', error);
    });

  loadGLB('models/minime.glb')
    .then(({ scene: modelScene, mixer: modelMixer }) => {
      modelScene.scale.set(2, 2, 2);
      modelScene.position.set(0, -1, 0); // Centered model

      // Ensure the model is always rendered correctly
      modelScene.traverse((child) => {
        if (child.isMesh) {
          child.renderOrder = 1; // Make sure this is rendered after the video
          child.material.depthTest = true; // Enable depth testing
          child.material.depthWrite = true; // Ensure depth writing

          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
          }

          child.material.needsUpdate = true;
          child.material.roughness = 0.4; // Adjust as needed
          child.material.metalness = 0; // Adjust as needed
          child.material.emissive = new THREE.Color(0x222222); // Slightly brighter emissive color

          // Debugging: Ensure the model's geometry is correct
          if (child.geometry) {
            console.log('Geometry:', child.geometry);
          }
        }
      });

      scene.add(modelScene);
      mixer = modelMixer;
      animate(); // Start animation loop
    })
    .catch(error => {
      console.error('Error loading GLB:', error);
    });

  function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
      const delta = clock.getDelta();
      mixer.update(delta);
    }

    renderer.render(scene, camera);
  }

  const clock = new THREE.Clock();

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindowResize, false);

  animate();
}

init();
