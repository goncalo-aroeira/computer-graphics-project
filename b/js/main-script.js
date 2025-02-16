//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var scene, renderer;

var frontalCamera, sideCamera, topCamera, isometricOrthogonalCamera, isometricPerspectiveCamera, activeCamera;

var geometry, baseMaterial, mesh, robot;

var greyColor = 0x333333;
var blueColor = 0x00008B;
var redColor = 0x8B0000;

var robotBlue = { color: blueColor, wireframe: true }
var robotGrey = { color: greyColor, wireframe: true }
var robotRed = { color: redColor, wireframe: true }

var baseMaterialBlue = new THREE.MeshBasicMaterial(robotBlue);
var baseMaterialGrey = new THREE.MeshBasicMaterial(robotGrey);
var baseMaterialRed = new THREE.MeshBasicMaterial(robotRed);

var rightLeg, leftLeg, waist, legs, feet, rightArm, leftArm, head, leftFoot, rightFoot, trailerBody, trailerFront, trailerBack, addTrailerWheel

var moveTrailerLeft = false;
var moveTrailerUp = false;
var moveTrailerRight = false;
var moveTrailerDown = false;
var moveArmsIn = false;
var moveArmsOut = false;

var rotateLegsUp = false;
var rotateLegsDown = false;
var rotateFeetDown = false;
var rotateFeetUp = false;
var rotateHeadUp = false;
var rotateHeadDown = false;

const maxRotationLegs = Math.PI/2;
const minRotationLegs = 0;
const maxRotationHead = Math.PI/2;
const minRotationFeet = -Math.PI/2;
const maxRotationFeet = 0;
const minRotationHead = 0;
const minRightArmPosition = -20;
const maxRightArmPosition = 0;
const minLeftArmPosition = 0;
const maxLeftArmPosition = 20;

const TRAILER_JOINT_X = 200;
const TRAILER_JOINT_Z = 0;

var changeWireframe = false;
var lockTrailer = false;
var wireframeHasChangedRecently = false;

var truckMode = false;

var trailerCollisionMin = new THREE.Vector3(-260, -40, -465)
var trailerCollisionMax = new THREE.Vector3(-140, 150, -70)

var trailerBoundingBox = new THREE.Box3Helper(new THREE.Box3(trailerCollisionMin, trailerCollisionMax), 0x00FF00);
trailerBoundingBox.visible = false;

const truckCollisionMin = new THREE.Vector3(-80, -40, -280)
const truckCollisionMax = new THREE.Vector3(80, 130, 40)

var truckBoundingBox = new THREE.Box3Helper(new THREE.Box3(truckCollisionMin, truckCollisionMax), 0xFF0000);
truckBoundingBox.visible = false;

const clock = new THREE.Clock();
var delta;

var inAnimation = false;

var ANGLE_SPEED
var ARMS_SPEED
var TRAILER_SPEED

/**
 * Stores all materials in the scene. Useful for toggling wireframe.
 * According to teacher sources, an even number of objects in the
 * scene results in a not-working wireframe toggle (see Discord).
 */
var allMaterials = [baseMaterialBlue, baseMaterialRed, baseMaterialGrey];

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    scene.position.x = 0;
    scene.position.y = 0;
    scene.position.z = 0;

    scene.add(trailerBoundingBox);
    scene.add(truckBoundingBox);

    createRobot();
    createTrailer(100,100,100);

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    var width = window.innerWidth;
    var height = window.innerHeight;

    frontalCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    frontalCamera.position.set(0, 0, 200)
    frontalCamera.lookAt(scene.position);

    sideCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    sideCamera.position.set(200, 0, 0)
    sideCamera.lookAt(scene.position);

    topCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    topCamera.position.set(0, 200, 0)
    topCamera.lookAt(scene.position);

    isometricOrthogonalCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    isometricOrthogonalCamera.position.set(100, 100, 100)
    isometricOrthogonalCamera.lookAt(scene.position);

    isometricPerspectiveCamera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
    isometricPerspectiveCamera.position.set(200, 200, 200)
    isometricPerspectiveCamera.lookAt(scene.position);

}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createTrailer() {
    'use strict';

    trailerBack = new THREE.Object3D();
    trailerFront = new THREE.Object3D();
    trailerBody = new THREE.Object3D();

    addTrailerBack(trailerBack, -200, 60, -355);
    addTrailerFront(trailerFront, -200, 80, -170);
    addTrailerWheel(trailerBack, -145, -15, -405);
    addTrailerWheel(trailerFront, -145, -15, -350);
    addTrailerWheel(trailerBack, -255, -15, -405);
    addTrailerWheel(trailerFront, -255, -15, -350);
    addTrailerConnection(trailerFront, -200, 15, -120 )

    trailerBody.add(trailerBack);
    trailerBody.add(trailerFront);
    scene.add(trailerBody);
}

function addTrailerBack(trailer, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(100, 150, 200);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    trailer.add(mesh);
}

function addTrailerFront(trailer, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(100, 110, 170);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    trailer.add(mesh);
}

function addTrailerWheel(trailer, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(20, 20, 10);
    mesh = new THREE.Mesh(geometry, baseMaterialGrey);
    mesh.position.set(x, y, z);
    mesh.rotation.z += Math.PI/2;
    trailer.add(mesh);
}

function addTrailerConnection(trailer, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(10, 20, 10);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    trailer.add(mesh);
}

function createRobot() {
    'use strict';

    rightLeg = new THREE.Object3D();
    leftLeg = new THREE.Object3D();
    waist = new THREE.Object3D();
    rightArm = new THREE.Object3D();
    leftArm = new THREE.Object3D();
    head = new THREE.Object3D();
    head.position.set(0,85,-30);
    legs = new THREE.Object3D();
    legs.position.set(0,5,0);
    feet = new THREE.Object3D();
    leftFoot = new THREE.Object3D();
    feet.position.set(0, -250, -15);
    rightFoot = new THREE.Object3D();

    legs.add(feet);

    addRobotFoot(rightFoot, -25, -10, 20);
    addRobotLeg(rightLeg, -25, -170, 0);
    addRobotThigh(rightLeg, -25, -52, 0);
    addWheel(rightLeg, -50, -120, 20);
    addWheel(rightLeg, -50, -175, 20);

    addRobotFoot(leftFoot, 25, -10, 20);
    addRobotLeg(leftLeg, 25, -170, 0);
    addRobotThigh(leftLeg, 25, -52, 0);
    addWheel(leftLeg, 50, -120, 20);
    addWheel(leftLeg, 50, -175, 20);

    addRobotWaist(waist, 0, 0, 0);
    addWheel(waist, 55, -15, 0);
    addWheel(waist, -55, -15, 0);

    addRobotAbdomen(0, 25, 0);
    addRobotChest(0, 60, 0);

    addArm(rightArm, 60, 60, -50);
    addForearm(rightArm, 60, 25, -20);
    addExaustingPipe(rightArm, 75, 80, -50);

    addArm(leftArm, -60, 60, -50);
    addForearm(leftArm, -60, 25, -20);
    addExaustingPipe(leftArm, -75, 80, -50);
    
    addHead(0, 15, 15); 
    addAntenna(17.5, 30, 15);
    addAntenna(-17.5, 30, 15);
    addEye(8, 15, 30);
    addEye(-8, 15, 30);

    legs.add(rightLeg);
    legs.add(leftLeg);

    feet.add(rightFoot);
    feet.add(leftFoot);

    scene.add(waist);
    scene.add(rightArm);
    scene.add(leftArm);
    scene.add(head);
    scene.add(legs);
    //scene.add(feet);
}

function addRobotFoot(foot, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(40, 10, 50);
    mesh = new THREE.Mesh(geometry, baseMaterialRed);
    mesh.position.set(x, y, z);
    foot.add(mesh);
}

function addRobotLeg(leg, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(40, 170, 40);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    leg.add(mesh);    
}

function addRobotThigh(leg, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 65, 20);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    leg.add(mesh);
}

function addRobotWaist(waist, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(100, 30, 60);
    mesh = new THREE.Mesh(geometry, baseMaterialRed);
    mesh.position.set(x, y, z);
    waist.add(mesh);
}

function addRobotAbdomen(x, y, z){
    'use strict';

    geometry = new THREE.BoxGeometry(60, 20, 60);
    mesh = new THREE.Mesh(geometry, baseMaterialRed);
    mesh.position.set(x, y, z);
    scene.add(mesh);
}

function addRobotChest(x, y, z){
    'use strict';

    geometry = new THREE.BoxGeometry(100, 50, 60);
    mesh = new THREE.Mesh(geometry, baseMaterialRed);
    mesh.position.set(x, y, z);
    scene.add(mesh);
}

function addArm(arm, x, y, z){
    'use strict';

    geometry = new THREE.BoxGeometry(20, 50, 40);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    arm.add(mesh);
}

function addForearm(arm, x, y, z){
    'use strict';

    geometry = new THREE.BoxGeometry(20, 20, 100);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    arm.add(mesh);
}

function addWheel(obj, x, y, z){
    'use strict';

    geometry = new THREE.CylinderGeometry(20, 20, 10);
    mesh = new THREE.Mesh(geometry, baseMaterialGrey);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHead(x, y, z){
    'use strict';
    
    geometry = new THREE.BoxGeometry(30,30,30);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    head.add(mesh);
}

function addAntenna(x, y, z){
    'use strict';

    geometry = new THREE.BoxGeometry(5,20,5);
    mesh = new THREE.Mesh(geometry, baseMaterialBlue);
    mesh.position.set(x, y, z);
    head.add(mesh);
}

function addEye(x, y, z){
    'use strict';

    geometry = new THREE.CylinderGeometry(5,5,5);
    mesh = new THREE.Mesh(geometry, baseMaterialRed);
    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI/2;
    head.add(mesh);
}

function addExaustingPipe(arm, x, y, z){
    'use strict';

    geometry = new THREE.CylinderGeometry(5, 5, 60);
    mesh = new THREE.Mesh(geometry, baseMaterialGrey);
    mesh.position.set(x, y, z);
    arm.add(mesh);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';
    if (truckCollisionMax.x > trailerCollisionMin.x && truckCollisionMin.x < trailerCollisionMax.x && truckCollisionMax.z > trailerCollisionMin.z && truckCollisionMin.z < trailerCollisionMax.z) {
        handleCollisions()
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';
    if(truckMode){
        inAnimation = true;
    }
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

    
    truckMode = (
        rightArm.position.x == minRightArmPosition &&
        leftArm.position.x == maxLeftArmPosition &&
        head.rotation.x == maxRotationHead &&
        legs.rotation.x == maxRotationLegs &&
        feet.rotation.x == minRotationFeet
    ) ? true : false

    if (changeWireframe && !wireframeHasChangedRecently) {
        allMaterials.forEach(material => material.wireframe = !material.wireframe)
        wireframeHasChangedRecently = true
    }
    if (!changeWireframe)
        wireframeHasChangedRecently = false;

    if (inAnimation && !lockTrailer) {
        if (Math.abs(trailerBody.position.x - TRAILER_JOINT_X) > TRAILER_SPEED) {
            trailerBody.position.x += trailerBody.position.x < TRAILER_JOINT_X ? 2*TRAILER_SPEED : -TRAILER_SPEED
            trailerCollisionMin.x += trailerBody.position.x < TRAILER_JOINT_X ? 2*TRAILER_SPEED : -TRAILER_SPEED
            trailerCollisionMax.x += trailerBody.position.x < TRAILER_JOINT_X ? 2*TRAILER_SPEED : -TRAILER_SPEED
        }
        else{
            trailerBody.position.x = TRAILER_JOINT_X 
            if (inAnimation){
                trailerCollisionMin.x += trailerBody.position.x - TRAILER_JOINT_X
                trailerCollisionMax.x += trailerBody.position.x - TRAILER_JOINT_X
            }
        }
        if (Math.abs(trailerBody.position.z - TRAILER_JOINT_Z) > TRAILER_SPEED) {
            trailerBody.position.z += trailerBody.position.z < TRAILER_JOINT_Z ? TRAILER_SPEED : -TRAILER_SPEED
            trailerCollisionMin.z += trailerBody.position.z < TRAILER_JOINT_Z ? TRAILER_SPEED : -TRAILER_SPEED
            trailerCollisionMax.z += trailerBody.position.z < TRAILER_JOINT_Z ? TRAILER_SPEED : -TRAILER_SPEED
        }
        else{
            trailerBody.position.z = TRAILER_JOINT_Z 
            if (inAnimation){
                trailerCollisionMin.z += trailerBody.position.z - TRAILER_JOINT_Z
                trailerCollisionMax.z += trailerBody.position.z - TRAILER_JOINT_Z
            }
        }
        
        if (trailerBody.position.x == TRAILER_JOINT_X && trailerBody.position.z == TRAILER_JOINT_Z) {
            inAnimation = false;
            lockTrailer = true;
        }
        
        if (inAnimation)
            return
    }

    truckMode = (
        rightArm.position.x == minRightArmPosition &&
        leftArm.position.x == maxLeftArmPosition &&
        head.rotation.x == maxRotationHead &&
        legs.rotation.x == maxRotationLegs &&
        feet.rotation.x == minRotationFeet
    ) ? true : false

    if(rotateFeetUp) {
        feet.rotation.x = THREE.Math.clamp(feet.rotation.x + ANGLE_SPEED, -Math.PI/2, 0)
        lockTrailer = false;
    }
    if(rotateFeetDown) {
        feet.rotation.x = THREE.Math.clamp(feet.rotation.x - ANGLE_SPEED , -Math.PI/2, 0)
        lockTrailer = false;
    }
    if(rotateLegsUp) {
        legs.rotation.x = THREE.Math.clamp(legs.rotation.x - ANGLE_SPEED, minRotationLegs, maxRotationLegs)
        lockTrailer = false;
    }
    if(rotateLegsDown) {
        legs.rotation.x = THREE.Math.clamp(legs.rotation.x + ANGLE_SPEED, minRotationLegs, maxRotationLegs)
        lockTrailer = false;
    }
    if(rotateHeadUp) {
        head.rotation.y = THREE.Math.clamp(head.rotation.y - ANGLE_SPEED, minRotationHead, maxRotationHead)
        lockTrailer = false;
    }
    if(rotateHeadDown) {
        head.rotation.y = THREE.Math.clamp(head.rotation.y + ANGLE_SPEED, minRotationHead, maxRotationHead)
        lockTrailer = false;
    }
    if (moveTrailerLeft && !lockTrailer) {
        trailerBody.translateX(-TRAILER_SPEED)
        trailerCollisionMin.x -= TRAILER_SPEED
        trailerCollisionMax.x -= TRAILER_SPEED
    }
    if (moveTrailerUp && !lockTrailer) {
        trailerBody.translateZ(-TRAILER_SPEED)
        trailerCollisionMin.z -= TRAILER_SPEED
        trailerCollisionMax.z -= TRAILER_SPEED
    }
    if (moveTrailerRight && !lockTrailer) {
        trailerBody.translateX(TRAILER_SPEED)
        trailerCollisionMin.x += TRAILER_SPEED
        trailerCollisionMax.x += TRAILER_SPEED
    }
    if (moveTrailerDown && !lockTrailer) {
        trailerBody.translateZ(TRAILER_SPEED)
        trailerCollisionMin.z += TRAILER_SPEED
        trailerCollisionMax.z += TRAILER_SPEED
    }
    if (moveArmsIn) {
        rightArm.position.x = THREE.Math.clamp(rightArm.position.x - ARMS_SPEED , minRightArmPosition, maxRightArmPosition)
        leftArm.position.x = THREE.Math.clamp(leftArm.position.x + ARMS_SPEED , minLeftArmPosition, maxLeftArmPosition)
        lockTrailer = false;
    }
    if (moveArmsOut) {
        rightArm.position.x = THREE.Math.clamp(rightArm.position.x + ARMS_SPEED , minRightArmPosition, maxRightArmPosition)
        leftArm.position.x = THREE.Math.clamp(leftArm.position.x - ARMS_SPEED , minLeftArmPosition, maxLeftArmPosition)
        lockTrailer = false;
    }
    lockTrailer = false
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, activeCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera();

    activeCamera = frontalCamera;

    render();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    render();

    delta = clock.getDelta();
    trailerBoundingBox.box.set(trailerCollisionMin, trailerCollisionMax);
    truckBoundingBox.box.set(truckCollisionMin, truckCollisionMax);

    ANGLE_SPEED = Math.PI*delta
    ARMS_SPEED = 50*delta
    TRAILER_SPEED = 200*delta

    update();
    checkCollisions()

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
        case 49: // 1
            activeCamera = frontalCamera;
            break;
        case 50: // 2
            activeCamera = sideCamera;
            break;
        case 51: // 3
            activeCamera = topCamera;
            break;
        case 52: // 4
            activeCamera = isometricOrthogonalCamera;
            break;
        case 53: // 5
            activeCamera = isometricPerspectiveCamera;
            break;
        case 54: // 6
            changeWireframe = true;
            break;
        case 113: // q
        case 81: // Q
            rotateFeetUp = true;
        break;
        case 97: // a
        case 65: // A
            rotateFeetDown = true;
        break;
        case 115: // s
        case 83: // S
            rotateLegsDown = true;
        break;
        case 119: // w
        case 87: // W
            rotateLegsUp = true;
        break;
        case 101: // e 
        case 69: // E
            moveArmsOut = true;
        break;
        case 114: // r
        case 82: // R
            rotateHeadUp = true;
        break;
        case 100: // d 
        case 68: // D
            moveArmsIn = true;
        break;
        case 102: // f
        case 70: // F
            rotateHeadDown = true;
        break;
        case 37:
            moveTrailerLeft = true;
        break;
        case 38:
            moveTrailerUp = true;
        break;
        case 39:
            moveTrailerRight = true;
        break;
        case 40:
            moveTrailerDown = true;
        break;
        case 72:
            showHelpers = true;
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
        case 37:
            moveTrailerLeft = false;
            break;
        case 38:
            moveTrailerUp = false;
            break;
        case 39:
            moveTrailerRight = false;
            break;
        case 40:
            moveTrailerDown = false;
            break;
        case 54:
            changeWireframe = false;
        break;
        case 81:
            rotateFeetUp = false;
           break;
        case 65:
            rotateFeetDown = false;
            break;
        case 87:
            rotateLegsUp = false;
            break;
        case 83:
            rotateLegsDown = false;
            break;
        case 69 :
            moveArmsOut = false;
            break;
        case 68:
            moveArmsIn = false;
            break;
        case 82:
            rotateHeadUp = false;
            break;
        case 70:
            rotateHeadDown = false;
            break
    }
}	