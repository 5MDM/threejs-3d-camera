import THREE from "three"

const RADIAN_HALF = 1.570796

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

function clamp(min: number, num: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

function supportsPointerLock() {
  return "pointerLockElement" in document
}

function newCamera(PerspectiveCamera: typeof THREE.PerspectiveCamera, o: {
  fov?: number,
  width: number,
  height: number,
  min?: number,
  max?: number
}) {
  return new PerspectiveCamera(
      o.fov || 80,
      o.width / o.height,
      o.min || 0.1,
      o.max || 1000
  )
}

/**
 * Sets the quaternions for the x-axis and z-axis rotations from the given angles
 * @private
 * @param Quaternion - The Three.js Quaternion class to be used
 * @param Vector3 - The Three.js Vector3 class to be used
 * @param mathX - The angle in radians for the x-axis rotation
 * @param mathY - The angle in radians for the z-axis rotation
 * @returns The pair of quaternions for the rotations
 */
function setQuaternion(Quaternion: typeof THREE.Quaternion, Vector3: typeof THREE.Vector3, mathX: number, mathY: number): { qx: THREE.Quaternion, qz: THREE.Quaternion } {
  const qx = new Quaternion()
  qx.setFromAxisAngle(new Vector3(0, 1, 0), mathX)
  const qz = new Quaternion()
  qz.setFromAxisAngle(new Vector3(1, 0, 0), mathY)

  return { qx, qz }
}
/**
 * Updates the camera quaternion from the given angles using the setQuaternion function
 * @param Quaternion - The Three.js Quaternion class to be used
 * @param Vector3 - The Three.js Vector3 class to be used
 * @param cam - The camera object to be updated
 * @param mathX - The angle in radians for the x-axis rotation
 * @param mathY - The angle in radians for the z-axis rotation
 */
function updateCamera({Quaternion, Vector3}: {
  Quaternion: typeof THREE.Quaternion,
  Vector3: typeof THREE.Vector3
}, cam: THREE.PerspectiveCamera, mathX: number, mathY: number) {
  const { qx, qz } = setQuaternion(Quaternion, Vector3, mathX, mathY)
  const q = new Quaternion()

  q.multiply(qx)
  q.multiply(qz)
  cam.quaternion.copy(q)
}
/**
 * A class that controls the camera quaternion and rotation from pointer events
 */
export class ControlCamera {
  /**
   * The angle in radians for the x-axis rotation
   */
  rx: number = RADIAN_HALF
  /**
   * The angle in radians for the y-axis rotation
   */
  ry: number = -RADIAN_HALF
  /**
   * A boolean flag that indicates whether the camera can pan using touch controls or not
   */
  canPanTouch: boolean = false
  /**
   * A boolean flag that indicates whether the camera can pan using mouse controls or not
   */
  canPanMouse: boolean = false
  /**
   * The mouse sensitivity for camera panning
   */
  mouseSensitivity: number = 100
  /**
   * The PerspectiveCamera that this camera uses
   */
  camera: THREE.PerspectiveCamera
  /**
   * The canvas element the camera is bound to
   */
  canvas!: HTMLCanvasElement
  /**
   * The Three.js classes to be used
   */
  protected readonly classes: RequiredThree

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
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fov?: number,
    min?: number,
    max?: number,
    mouseSensitivity?: number,
  }, classes: RequiredThree) {
    if (window == undefined)
      console.warn("threejs-3d-camera should only be used in the browser")
    this.classes = classes
    this.camera = newCamera(classes.PerspectiveCamera, o)
    this.mouseSensitivity = o?.mouseSensitivity || 100
    this.bind(o.canvas)
    this.loop()
    return this
  }

  /**
   * Updates the camera quaternion from the current angles and requests an animation frame
   */
  private loop() {
    updateCamera({...this.classes}, this.camera, this.rx, this.ry)
    requestAnimationFrame(() => this.loop())
  }

  /**
   * Binds the control camera to a given element
   * @param el - The element to bind to
   * @returns The current instance of ControlCamera
   */
  private bind(el: HTMLCanvasElement) {
    if (this.canvas) throw new Error("Camera is already bound to an element")
    this.canvas = el
    el.addEventListener("pointerdown", e => this.down(e))
    // Use targetTouches instead of
    // regular touches or else it glitches
    el.addEventListener("touchmove", e => {
      e.preventDefault()
      this.moveTouch(e.targetTouches[e.targetTouches.length - 1])
    })
    el.addEventListener("pointerup", e => this.up(e))

    el.addEventListener("mousemove", e => {
      if (document.pointerLockElement != el) return
      this.moveMouse(e)
    })
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement == el) return
      this.disableMouse()
      this.onPointerUnlock()
    })
    return this
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
  }

  /**
   * A function that gets called on the pointer move event
   */
  onPointerMove = (_e: {
    x: number,
    y: number
  }) => {}

  /**
   * A function that gets called when the pointer gets unlocked
   */
  onPointerUnlock = () => {}

  /**
   * Handles the pointer down event and sets the touch information
   * @param e - The pointer down event
   */
  private down(e: PointerEvent) {
    if (!this.touch.down) {
      this.touch.down = true
      this.touch.id = e.pointerId
      this.touch.lx = e.pageX
      this.touch.ly = e.pageY
    }
  }

  /**
   * Handles the touch move event and updates the touch information and angles
   * @param e - The touch move or mouse move event
   */
  private moveTouch(e: Touch) {
    if (!this.canPanTouch) return
    if (e.identifier == this.touch.id) {
      this.touch.x = this.touch.lx - e.pageX
      this.touch.y = this.touch.ly - e.pageY
      this.touch.lx = e.pageX
      this.touch.ly = e.pageY

      this.onPointerMove({
        x: this.touch.x,
        y: this.touch.y
      })
    }
  }

  /**
   * Handles the mouse move event and updates the angles
   * @param e - The touch move or mouse move event
   */
  private moveMouse(e: MouseEvent) {
    if (!this.canPanMouse) return
    const dx = e.movementX
    const dy = e.movementY

    this.rx -= dx * ((0.005 * this.mouseSensitivity) / 100)
    this.ry = clamp(
        -Math.PI / 2 + 0.1,
        this.ry - dy * ((0.005 * this.mouseSensitivity) / 100),
        Math.PI / 3
    )

  }

  /**
   * Handles the pointer up event and resets the touch information
   * @param _e - The pointer up event
   */
  private up(_e: PointerEvent) {
    if (this.touch.down) {
      this.touch.down = false
      this.touch.id = NaN
    }
  }

  /**
   * Enables the camera panning using touch screen and adds the event listeners to the element
   * @returns The current instance of ControlCamera
   */
  enableTouch() {
    if (!this.canvas)
      throw new Error("Cannot enable camera panning without binding element")
    this.canPanTouch = true
    return this
  }

  /**
   * Enables the camera panning using the mouse and adds the event listeners to the element
   * @returns The current instance of ControlCamera
   */
  enableMouse() {
    if (!this.canvas)
      throw new Error("Cannot enable camera panning without binding element")
    this.canPanMouse = true
    if (supportsPointerLock()) this.canvas.requestPointerLock()
    return this
  }

  /**
   * Sets the default angles for the camera quaternion and updates it accordingly
   * @param x - The angle in radians for the x-axis rotation
   * @param y - The angle in radians for the y-axis rotation
   * @returns The current instance of ControlCamera
   */
  setDefault (x: number, y: number) {
    updateCamera({...this.classes}, this.camera, x, y)
    this.rx = x
    this.ry = y
    return this
  }

  /**
   * Disables the camera panning using touch controls
   * @returns The current instance of ControlCamera
   */
  disableTouch() {
    this.canPanTouch = false
    return this
  }

  /**
   * Disables the camera panning using mouse controls
   * @returns The current instance of ControlCamera
   */
  disableMouse() {
    this.canPanTouch = false
    return this
  }
}

/**
 * A class that extends the {@link ControlCamera} class and adds movement functionality
 */
export class MovementCamera extends ControlCamera {
  /**
   * The direction vector for the camera movement
   */
  direction: THREE.Vector3 = new this.classes.Vector3()
  /**
   * A boolean flag that indicates whether the camera can move or not
   */
  canMove: boolean = true
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
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fov?: number,
    min?: number,
    max?: number,
    mouseSensitivity?: number,
  }, classes: RequiredThree) {
    super(o, classes)
  }

  /**
   * A function that handles the camera movement event
   */
  onMove = function() {}
  /**
   * A function that modifies the movement speed before applying it
   * @param s - The movement speed
   * @returns The modified movement speed
   */
  preMove = function(s: number): number {
    return s
  }

  /**
   * Moves the camera forward directly, including the y-axis
   * @param [s=0.05] - The movement speed
   */
  rawMoveForward(s: number = 0.05) {
    s = this.preMove(s)
    const cameraDirection = new this.classes.Vector3()
    this.camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0

    const delta = cameraDirection.multiplyScalar(s)
    this.camera.position.add(delta)
    this.onMove()
  }

  /**
   * Moves the camera forward without changing the y-axis
   * @param [s=0.05] - The movement speed
   */
  moveForward(s: number = 0.05) {
    s = this.preMove(s)
    const cameraDirection = new this.classes.Vector3()
    this.camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0 // Disregard y-axis
    cameraDirection.normalize() // THIS IS IMPORTANT

    const delta = cameraDirection.multiplyScalar(s)
    this.camera.position.add(delta)
    this.onMove()
  }

  /**
   * Moves the camera backwards without changing the y-axis
   * @param [s=0.05] - The movement speed
   */
  moveBackward(s: number = 0.05) {
    this.moveForward(-s)
  }

  /**
   * Moves the camera left
   * @param [s=0.05] - The movement speed
   */
  moveLeft(s: number = 0.05) {
    s = this.preMove(s)
    this.camera.translateX(-s)
    this.onMove()
  }

  /**
   * Moves the camera right
   * @param [s=0.05] - The movement speed
   */
  moveRight(s: number = 0.05) {
    s = this.preMove(s)
    this.camera.translateX(s)
    this.onMove()
  }

  /**
   * Moves the camera up vertically
   * @param [s=0.04] - The movement speed
   */
  moveUp(s: number = 0.04) {
    s = this.preMove(s)
    this.camera.position.y += s
    this.onMove()
  }

  /**
   * Moves the camera down vertically
   * @param [s=0.04] - The movement speed
   */
  moveDown(s: number = 0.04) {
    this.moveUp(-s)
  }
}