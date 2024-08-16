import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function loadGLB(path) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        path,
        (gltf) => {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              action.play();
            });
            resolve({ scene: gltf.scene, mixer });
        },
        (progress) => console.log('Loading progress:', progress),
        (error) => reject(error)
      );
    });
}

export default loadGLB;
