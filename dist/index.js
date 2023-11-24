"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovementCamera = exports.ControlCamera = void 0;
const three_1 = require("three");
const RADIAN_HALF = 1.570796;
function clamp(min, num, max) {
    return Math.min(Math.max(num, min), max);
}
function supportsPointerLock() {
    return "pointerLockElement" in document;
}
function newCamera(o) {
    return new three_1.PerspectiveCamera(o.fov || 80, o.width / o.height, o.min || 0.1, o.max || 1000);
}
/**
 * Sets the quaternions for the x-axis and z-axis rotations from the given angles
 * @private
 * @param mathX - The angle in radians for the x-axis rotation
 * @param mathY - The angle in radians for the z-axis rotation
 * @returns The pair of quaternions for the rotations
 */
function setQuaternion(mathX, mathY) {
    const qx = new three_1.Quaternion();
    qx.setFromAxisAngle(new three_1.Vector3(0, 1, 0), mathX);
    const qz = new three_1.Quaternion();
    qz.setFromAxisAngle(new three_1.Vector3(1, 0, 0), mathY);
    return { qx, qz };
}
/**
 * Updates the camera quaternion from the given angles using the setQuaternion function
 * @param cam - The camera object to be updated
 * @param mathX - The angle in radians for the x-axis rotation
 * @param mathY - The angle in radians for the z-axis rotation
 */
function updateCamera(cam, mathX, mathY) {
    const { qx, qz } = setQuaternion(mathX, mathY);
    const q = new three_1.Quaternion();
    q.multiply(qx);
    q.multiply(qz);
    cam.quaternion.copy(q);
}
/**
 * A class that controls the camera quaternion and rotation from pointer events
 */
class ControlCamera {
    /**
     * The angle in radians for the x-axis rotation
     */
    rx = RADIAN_HALF;
    /**
     * The angle in radians for the y-axis rotation
     */
    ry = -RADIAN_HALF;
    /**
     * A boolean flag that indicates whether the camera can pan using touch controls or not
     */
    canPanTouch = false;
    /**
     * A boolean flag that indicates whether the camera can pan using mouse controls or not
     */
    canPanMouse = false;
    /**
     * The mouse sensitivity for camera panning
     */
    mouseSensitivity = 100;
    /**
     * The PerspectiveCamera that this camera uses
     */
    camera;
    /**
     * The canvas element the camera is bound to
     */
    canvas;
    /**
     * Creates a new ControlCamera instance with a new camera object
     * @param o.canvas - The canvas element to bind the camera to
     * @param o.width - The canvas width
     * @param o.height - The canvas height
     * @param [o={}] - The options for the camera object
     * @param [o.fov=80] - The field of view for the camera in degrees
     * @param [o.min=0.1] - The near clipping plane for the camera
     * @param [o.max=1000] - The far clipping plane for the camera
     * @param [o.mouseSensitivity=100] - The sensitivity of the camera movement
     */
    constructor(o) {
        if (window == undefined)
            console.warn("threejs-3d-camera should only be used in the browser");
        this.camera = newCamera(o);
        this.mouseSensitivity = o?.mouseSensitivity || 100;
        this.bind(o.canvas);
        this.loop();
        return this;
    }
    /**
     * Updates the camera quaternion from the current angles and requests an animation frame
     */
    loop() {
        updateCamera(this.camera, this.rx, this.ry);
        requestAnimationFrame(() => this.loop());
    }
    /**
     * Binds the control camera to a given element
     * @param el - The element to bind to
     * @returns The current instance of ControlCamera
     */
    bind(el) {
        if (this.canvas)
            throw new Error("Camera is already bound to an element");
        this.canvas = el;
        el.addEventListener("pointerdown", e => this.down(e));
        // Use targetTouches instead of
        // regular touches or else it glitches
        el.addEventListener("touchmove", e => {
            e.preventDefault();
            this.moveTouch(e.targetTouches[e.targetTouches.length - 1]);
        });
        el.addEventListener("pointerup", e => this.up(e));
        el.addEventListener("mousemove", e => {
            if (document.pointerLockElement != el)
                return;
            this.moveMouse(e);
        });
        document.addEventListener("pointerlockchange", () => {
            if (document.pointerLockElement == el)
                return;
            this.disableMouse();
            this.onPointerUnlock();
        });
        return this;
    }
    /**
     * An object that stores the touch information
     */
    touch = {
        /**
         * A flag indicating whether a touch event is currently active
         */
        down: false,
        /**
         * The pointer event identifier of the active touch event
         */
        id: NaN,
        /**
         * The x-coordinate of the last touch event
         */
        lx: 0,
        /**
         * The y-coordinate of the last touch event
         */
        ly: 0,
        /**
         * The difference in the x-coordinate between the current and the last touch event
         */
        x: 0,
        /**
         * The difference in the y-coordinate between the current and the last touch event
         */
        y: 0
    };
    /**
     * A function that gets called on the pointer move event
     */
    onPointerMove = (_e) => { };
    /**
     * A function that gets called when the pointer gets unlocked
     */
    onPointerUnlock = () => { };
    /**
     * Handles the pointer down event and sets the touch information
     * @param e - The pointer down event
     */
    down(e) {
        if (!this.touch.down) {
            this.touch.down = true;
            this.touch.id = e.pointerId;
            this.touch.lx = e.pageX;
            this.touch.ly = e.pageY;
        }
    }
    /**
     * Handles the touch move event and updates the touch information and angles
     * @param e - The touch move or mouse move event
     */
    moveTouch(e) {
        if (!this.canPanTouch)
            return;
        if (e.identifier == this.touch.id) {
            this.touch.x = this.touch.lx - e.pageX;
            this.touch.y = this.touch.ly - e.pageY;
            this.touch.lx = e.pageX;
            this.touch.ly = e.pageY;
            this.onPointerMove({
                x: this.touch.x,
                y: this.touch.y
            });
        }
    }
    /**
     * Handles the mouse move event and updates the angles
     * @param e - The touch move or mouse move event
     */
    moveMouse(e) {
        if (!this.canPanMouse)
            return;
        const dx = e.movementX;
        const dy = e.movementY;
        this.rx -= dx * ((0.005 * this.mouseSensitivity) / 100);
        this.ry = clamp(-Math.PI / 2 + 0.1, this.ry - dy * ((0.005 * this.mouseSensitivity) / 100), Math.PI / 3);
    }
    /**
     * Handles the pointer up event and resets the touch information
     * @param _e - The pointer up event
     */
    up(_e) {
        if (this.touch.down) {
            this.touch.down = false;
            this.touch.id = NaN;
        }
    }
    /**
     * Enables the camera panning using touch screen and adds the event listeners to the element
     * @returns The current instance of ControlCamera
     */
    enableTouch() {
        if (!this.canvas)
            throw new Error("Cannot enable camera panning without binding element");
        this.canPanTouch = true;
        return this;
    }
    /**
     * Enables the camera panning using the mouse and adds the event listeners to the element
     * @returns The current instance of ControlCamera
     */
    enableMouse() {
        if (!this.canvas)
            throw new Error("Cannot enable camera panning without binding element");
        this.canPanMouse = true;
        if (supportsPointerLock())
            this.canvas.requestPointerLock();
        return this;
    }
    /**
     * Sets the default angles for the camera quaternion and updates it accordingly
     * @param x - The angle in radians for the x-axis rotation
     * @param y - The angle in radians for the y-axis rotation
     * @returns The current instance of ControlCamera
     */
    setDefault(x, y) {
        updateCamera(this.camera, x, y);
        this.rx = x;
        this.ry = y;
        return this;
    }
    /**
     * Disables the camera panning using touch controls
     * @returns The current instance of ControlCamera
     */
    disableTouch() {
        this.canPanTouch = false;
        return this;
    }
    /**
     * Disables the camera panning using mouse controls
     * @returns The current instance of ControlCamera
     */
    disableMouse() {
        this.canPanTouch = false;
        return this;
    }
}
exports.ControlCamera = ControlCamera;
/**
 * A class that extends the ControlCamera class and adds movement functionality
 */
class MovementCamera extends ControlCamera {
    /**
     * The direction vector for the camera movement
     */
    direction = new three_1.Vector3();
    /**
     * A boolean flag that indicates whether the camera can move or not
     */
    canMove = true;
    /**
     * Creates a new MovementCamera instance with a new camera object
     * @param o.canvas - The canvas element to bind the camera to
     * @param o.width - The canvas width
     * @param o.height - The canvas height
     * @param [o={}] - The options for the camera object
     * @param [o.fov=80] - The field of view for the camera in degrees
     * @param [o.min=0.1] - The near clipping plane for the camera
     * @param [o.max=1000] - The far clipping plane for the camera
     * @param [o.mouseSensitivity=100] - The sensitivity of the camera movement
     */
    constructor(o) {
        super(o);
    }
    /**
     * A function that handles the camera movement event
     */
    onMove = function () { };
    /**
     * A function that modifies the movement speed before applying it
     * @param s - The movement speed
     * @returns The modified movement speed
     */
    preMove = function (s) {
        return s;
    };
    /**
     * Moves the camera forward directly, including the y-axis
     * @param [s=0.05] - The movement speed
     */
    rawMoveForward(s = 0.05) {
        s = this.preMove(s);
        const cameraDirection = new three_1.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        const delta = cameraDirection.multiplyScalar(s);
        this.camera.position.add(delta);
        this.onMove();
    }
    /**
     * Moves the camera forward without changing the y-axis
     * @param [s=0.05] - The movement speed
     */
    moveForward(s = 0.05) {
        s = this.preMove(s);
        const cameraDirection = new three_1.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Disregard y-axis
        cameraDirection.normalize(); // THIS IS IMPORTANT
        const delta = cameraDirection.multiplyScalar(s);
        this.camera.position.add(delta);
        this.onMove();
    }
    /**
     * Moves the camera backwards without changing the y-axis
     * @param [s=0.05] - The movement speed
     */
    moveBackward(s = 0.05) {
        this.moveForward(-s);
    }
    /**
     * Moves the camera left
     * @param [s=0.05] - The movement speed
     */
    moveLeft(s = 0.05) {
        s = this.preMove(s);
        this.camera.translateX(-s);
        this.onMove();
    }
    /**
     * Moves the camera right
     * @param [s=0.05] - The movement speed
     */
    moveRight(s = 0.05) {
        s = this.preMove(s);
        this.camera.translateX(s);
        this.onMove();
    }
    /**
     * Moves the camera up vertically
     * @param [s=0.04] - The movement speed
     */
    moveUp(s = 0.04) {
        s = this.preMove(s);
        this.camera.position.y += s;
        this.onMove();
    }
    /**
     * Moves the camera down vertically
     * @param [s=0.04] - The movement speed
     */
    moveDown(s = 0.04) {
        this.moveUp(-s);
    }
}
exports.MovementCamera = MovementCamera;
if (typeof window === "object") {
    window.ControlCamera = ControlCamera;
    window.MovementCamera = MovementCamera;
}