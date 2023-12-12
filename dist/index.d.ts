import THREE from "three";
/**
 * Required Three.js classes for the camera classes
 */
interface RequiredThree {
    /**
     * The Three.js PerspectiveCamera class
     * @see https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
     */
    PerspectiveCamera: typeof THREE.PerspectiveCamera;
    /**
     * The Three.js Quaternion class
     * @see https://threejs.org/docs/#api/en/math/Quaternion
     */
    Quaternion: typeof THREE.Quaternion;
    /**
     * The Three.js Vector3 class
     * @see https://threejs.org/docs/#api/en/math/Vector3
     */
    Vector3: typeof THREE.Vector3;
}
/**
 * A class that controls the camera quaternion and rotation from pointer events
 */
export declare class ControlCamera {
    /**
     * The angle in radians for the x-axis rotation
     */
    rx: number;
    /**
     * The angle in radians for the y-axis rotation
     */
    ry: number;
    /**
     * A boolean flag that indicates whether the camera can pan using touch controls or not
     */
    canPanTouch: boolean;
    /**
     * A boolean flag that indicates whether the camera can pan using mouse controls or not
     */
    canPanMouse: boolean;
    /**
     * The mouse sensitivity for camera panning
     */
    mouseSensitivity: number;
    /**
     * The PerspectiveCamera that this camera uses
     */
    camera: THREE.PerspectiveCamera;
    /**
     * The canvas element the camera is bound to
     */
    canvas: HTMLCanvasElement;
    /**
     * The Three.js classes to be used
     */
    protected readonly classes: RequiredThree;
    /**
     * Creates a new ControlCamera instance with a new camera object
     * @param o - The options for the camera object
     * @param o.canvas - The canvas element to bind the camera to
     * @param o.width - The canvas width
     * @param o.height - The canvas height
     * @param [o.fov=80] - The field of view for the camera in degrees
     * @param [o.min=0.1] - The near clipping plane for the camera
     * @param [o.max=1000] - The far clipping plane for the camera
     * @param [o.mouseSensitivity=100] - The sensitivity of the camera movement
     * @param classes - The Three.js classes to be used
     */
    constructor(o: {
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
        fov?: number;
        min?: number;
        max?: number;
        mouseSensitivity?: number;
    }, classes: RequiredThree);
    /**
     * Updates the camera quaternion from the current angles and requests an animation frame
     */
    private loop;
    /**
     * Binds the control camera to a given element
     * @param el - The element to bind to
     * @returns The current instance of ControlCamera
     */
    private bind;
    /**
     * An object that stores the touch information
     */
    touch: {
        /**
         * A flag indicating whether a touch event is currently active
         */
        down: boolean;
        /**
         * The pointer event identifier of the active touch event
         */
        id: number;
        /**
         * The x-coordinate of the last touch event
         */
        lx: number;
        /**
         * The y-coordinate of the last touch event
         */
        ly: number;
        /**
         * The difference in the x-coordinate between the current and the last touch event
         */
        x: number;
        /**
         * The difference in the y-coordinate between the current and the last touch event
         */
        y: number;
    };
    /**
     * A function that gets called on the pointer move event
     */
    onPointerMove: (_e: {
        x: number;
        y: number;
    }) => void;
    /**
     * A function that gets called when the pointer gets unlocked
     */
    onPointerUnlock: () => void;
    /**
     * Handles the pointer down event and sets the touch information
     * @param e - The pointer down event
     */
    private down;
    /**
     * Handles the touch move event and updates the touch information and angles
     * @param e - The touch move or mouse move event
     */
    private moveTouch;
    /**
     * Handles the mouse move event and updates the angles
     * @param e - The touch move or mouse move event
     */
    private moveMouse;
    /**
     * Handles the pointer up event and resets the touch information
     * @param _e - The pointer up event
     */
    private up;
    /**
     * Enables the camera panning using touch screen and adds the event listeners to the element
     * @returns The current instance of ControlCamera
     */
    enableTouch(): this;
    /**
     * Enables the camera panning using the mouse and adds the event listeners to the element
     * @returns The current instance of ControlCamera
     */
    enableMouse(): this;
    /**
     * Sets the default angles for the camera quaternion and updates it accordingly
     * @param x - The angle in radians for the x-axis rotation
     * @param y - The angle in radians for the y-axis rotation
     * @returns The current instance of ControlCamera
     */
    private setDefault;
    /**
     * Disables the camera panning using touch controls
     * @returns The current instance of ControlCamera
     */
    disableTouch(): this;
    /**
     * Disables the camera panning using mouse controls
     * @returns The current instance of ControlCamera
     */
    disableMouse(): this;
}
/**
 * A class that extends the {@link ControlCamera} class and adds movement functionality
 */
export declare class MovementCamera extends ControlCamera {
    /**
     * The direction vector for the camera movement
     */
    direction: THREE.Vector3;
    /**
     * A boolean flag that indicates whether the camera can move or not
     */
    canMove: boolean;
    /**
     * Creates a new MovementCamera instance with a new camera object
     * @param o - The options for the camera object
     * @param o.canvas - The canvas element to bind the camera to
     * @param o.width - The canvas width
     * @param o.height - The canvas height
     * @param [o.fov=80] - The field of view for the camera in degrees
     * @param [o.min=0.1] - The near clipping plane for the camera
     * @param [o.max=1000] - The far clipping plane for the camera
     * @param [o.mouseSensitivity=100] - The sensitivity of the camera movement
     * @param classes - The Three.js classes to be used
     */
    constructor(o: {
        canvas: HTMLCanvasElement;
        width: number;
        height: number;
        fov?: number;
        min?: number;
        max?: number;
        mouseSensitivity?: number;
    }, classes: RequiredThree);
    /**
     * A function that handles the camera movement event
     */
    onMove: () => void;
    /**
     * A function that modifies the movement speed before applying it
     * @param s - The movement speed
     * @returns The modified movement speed
     */
    preMove: (s: number) => number;
    /**
     * Moves the camera forward directly, including the y-axis
     * @param [s=0.05] - The movement speed
     */
    rawMoveForward(s?: number): void;
    /**
     * Moves the camera forward without changing the y-axis
     * @param [s=0.05] - The movement speed
     */
    moveForward(s?: number): void;
    /**
     * Moves the camera backwards without changing the y-axis
     * @param [s=0.05] - The movement speed
     */
    moveBackward(s?: number): void;
    /**
     * Moves the camera left
     * @param [s=0.05] - The movement speed
     */
    moveLeft(s?: number): void;
    /**
     * Moves the camera right
     * @param [s=0.05] - The movement speed
     */
    moveRight(s?: number): void;
    /**
     * Moves the camera up vertically
     * @param [s=0.04] - The movement speed
     */
    moveUp(s?: number): void;
    /**
     * Moves the camera down vertically
     * @param [s=0.04] - The movement speed
     */
    moveDown(s?: number): void;
}
export {};
