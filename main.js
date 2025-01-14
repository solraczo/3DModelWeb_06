import * as THREE from 'https://miichipost.com/viewport/3DModelWeb_02/libs/three.module.js';
import { OrbitControls } from 'https://miichipost.com/viewport/3DModelWeb_02/libs/OrbitControls.js';
import { GLTFLoader } from 'https://miichipost.com/viewport/3DModelWeb_02/libs/GLTFLoader.js';
import { FBXLoader } from 'https://miichipost.com/viewport/3DModelWeb_02/libs/FBXLoader.js';
import { RGBELoader } from 'https://miichipost.com/viewport/3DModelWeb_02/libs/RGBELoader.js';
import Stats from 'https://miichipost.com/viewport/3DModelWeb_02/libs/stats.module.js';

let mixerGLTF, mixerFBX; // AnimationMixers para los modelos
let actionsGLTF = {}, actionsFBX = {}; // Acciones de animación para cada modelo
let clock = new THREE.Clock(); // Reloj para actualizar los mixers

// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.2, 0.2, 0.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mejora la representación de color
renderer.toneMappingExposure = 1.5; // Ajustar la exposición
renderer.outputEncoding = THREE.sRGBEncoding; // Configuración de color
document.body.appendChild(renderer.domElement);

// Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Iluminación
const light = new THREE.PointLight(0xffffff, 0.15);
light.position.set(0, 0.08, 0.1);
scene.add(light);

// Nueva luz SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.3);
spotLight.position.set(0, 0.1, 0.4); // Posición del SpotLight
spotLight.angle = Math.PI / 6; // Ángulo de apertura del cono
spotLight.penumbra = 0.3; // Penumbra para suavizar los bordes de la luz
spotLight.castShadow = true; // Sombras activadas
scene.add(spotLight);

// Nueva luz de área
const rectLight = new THREE.RectAreaLight(0xffffff, 1, 10, 10);
rectLight.position.set(0, 0.2, 0); // Posición del área de luz
rectLight.lookAt(0, 0, 0); // Direccionar hacia el centro de la escena
scene.add(rectLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Cargar HDRI como entorno
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    'https://miichipost.com/viewport/3DModelWeb_02/models/brown_photostudio_02_2k.hdr', // Ruta al archivo HDR
    (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping; // Mapear como entorno
        scene.environment = texture; // Usar como iluminación
        scene.background = texture; // Usar como fondo
        console.log('HDRI cargado correctamente.');
    },
    undefined,
    (error) => console.error('Error al cargar el HDRI:', error)
);


// Cargar el modelo GLTF con animaciones
const gltfLoader = new GLTFLoader();
gltfLoader.load(
    'https://miichipost.com/viewport/3DModelWeb_02/models/cilindro6.gltf',
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(2, 2, 2);
        model.position.set(0, -0.2, 0);
        scene.add(model);

        // Crear el AnimationMixer para GLTF
        mixerGLTF = new THREE.AnimationMixer(model);

        // Configurar las animaciones
        gltf.animations.forEach((clip) => {
            actionsGLTF[clip.name] = mixerGLTF.clipAction(clip);
            actionsGLTF[clip.name].setLoop(THREE.LoopOnce);
            actionsGLTF[clip.name].clampWhenFinished = true;
        });

        console.log('Animaciones GLTF disponibles:', Object.keys(actionsGLTF));
    },
    (xhr) => console.log('GLTF loaded:', (xhr.loaded / xhr.total) * 100 + '%'),
    (error) => console.error('Error al cargar el modelo GLTF:', error)
);

// Cargar el modelo FBX con animaciones
const fbxLoader = new FBXLoader();
fbxLoader.load(
    'https://miichipost.com/viewport/3DModelWeb_02/models/tia_15.fbx',
    (object) => {
        object.scale.set(0.04, 0.04, 0.04);
        object.position.set(0, -0.2, -0.1);
        scene.add(object);

        // Crear el AnimationMixer para FBX
        mixerFBX = new THREE.AnimationMixer(object);

        // Listar y configurar las animaciones disponibles en FBX
        console.log('Animaciones detectadas en el modelo FBX:');
        if (object.animations.length > 0) {
            object.animations.forEach((clip) => {
                console.log(`- ${clip.name}`);
                actionsFBX[clip.name] = mixerFBX.clipAction(clip);
                actionsFBX[clip.name].setLoop(THREE.LoopOnce);
                actionsFBX[clip.name].clampWhenFinished = true;
            });
        } else {
            console.error('No se encontraron animaciones en el archivo FBX.');
        }
    },
    (xhr) => console.log('FBX loaded:', (xhr.loaded / xhr.total) * 100 + '%'),
    (error) => console.error('Error al cargar el modelo FBX:', error)
);

// Stats de rendimiento
const stats = new Stats();
document.body.appendChild(stats.dom);

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animación principal
renderer.setAnimationLoop(() => {
    const delta = clock.getDelta(); // Tiempo desde el último cuadro
    if (mixerGLTF) mixerGLTF.update(delta); // Actualizar el mixer GLTF
    if (mixerFBX) mixerFBX.update(delta); // Actualizar el mixer FBX
    controls.update();
    renderer.render(scene, camera);
    stats.update();
});

// **CHATBOX INTEGRATION**
const chatContainer = document.createElement('div');
chatContainer.style.position = 'absolute';
chatContainer.style.bottom = '10px';
chatContainer.style.left = '10px';
chatContainer.style.width = '300px';
chatContainer.style.background = 'rgba(0, 0, 0, 0.7)';
chatContainer.style.padding = '10px';
chatContainer.style.borderRadius = '5px';
chatContainer.style.color = 'white';
chatContainer.style.fontFamily = 'Arial, sans-serif';

const chatInput = document.createElement('input');
chatInput.type = 'text';
chatInput.placeholder = 'Escribe un comando...';
chatInput.style.width = '100%';
chatInput.style.padding = '5px';
chatInput.style.border = 'none';
chatInput.style.borderRadius = '3px';

chatContainer.appendChild(chatInput);
document.body.appendChild(chatContainer);

// Manejar comandos del chatbox
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = chatInput.value.trim().toLowerCase();

        if (actionsGLTF[command]) {
            actionsGLTF[command].reset().play();
            console.log(`Reproduciendo animación GLTF: ${command}`);
        } else if (actionsFBX[command]) {
            actionsFBX[command].reset().play();
            console.log(`Reproduciendo animación FBX: ${command}`);
        } else {
            console.error(`No se encontró la animación "${command}".`);
        }

        chatInput.value = ''; // Limpiar el chatbox
    }
});
//prueba