const { Quaternion, Vector3, PerspectiveCamera } = require("three");

// Thanks to DeltAndy123 for adding mouse support

const RADIAN_HALF = 1.570796

function supportsPointerLock() {
  return "pointerLockElement" in document
}

function newCamera(o = {}) {
  return new PerspectiveCamera(
    o.fov || 80,
    o.width / o.height,
    o.min || 0.1,
    o.max || 1000
  )
}

function setQuaternion(mathX, mathY) {
  const qx = new Quaternion()
  qx.setFromAxisAngle(new Vector3(0, 1, 0), mathX)
  const qz = new Quaternion()
  qz.setFromAxisAngle(new Vector3(1, 0, 0), mathY)

  return { qx, qz }
}

function updateCamera(cam, mathX, mathY) {
  const { qx, qz } = setQuaternion(mathX, mathY)
  const q = new Quaternion()

  q.multiply(qx)
  q.multiply(qz)
  cam.quaternion.copy(q)
}

class ControlCamera {

  rx = RADIAN_HALF

  ry = -RADIAN_HALF

  canPanTouch = false

  canPanMouse = false

  constructor(o) {
    if (window == undefined)
      console.warn("threejs-3d-camera should only be used in the browser")
    this.camera = newCamera(o)
    this.mouseSensitivity = o?.mouseSensitivity || 100
    this.loop()
    return this
  }

  loop() {
    updateCamera(this.camera, this.rx, this.ry)
    requestAnimationFrame(() => this.loop())
  }

  bind(el) {
    if (this.el) throw new Error("Camera is already binded to an element")
    this.el = el
    el.addEventListener("pointerdown", e => this.down(e))

    el.addEventListener("touchmove", e => {
      e.preventDefault()
      this.moveTouch(e.targetTouches[e.targetTouches.length - 1])
    })
    el.addEventListener("pointerup", e => this.up(e))

    el.addEventListener("mousemove", e => {
      if (document.pointerLockElement != el) return
      this.moveMouse(e)
    })
    document.addEventListener("pointerlockchange", e => {
      if (document.pointerLockElement == el) return
      this.disableMouse()
      this.onPointerUnlock()
    })
    return this
  }

  touch = {
    down: false,
    id: null,
    lx: 0,
    ly: 0,
    x: 0,
    y: 0
  }

  onPointerMove = (..._args) => {}

  onPointerUnlock = () => {}

  down(e) {
    if (!this.touch.down) {
      this.touch.down = true
      this.touch.id = e.pointerId
      this.touch.lx = e.pageX
      this.touch.ly = e.pageY
    }
  }

  moveTouch(e) {
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

  moveMouse(e) {
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

  up(_e) {
    if (this.touch.down) {
      this.touch.down = false
      this.touch.id = null
    }
  }

  enableTouch() {
    if (!this.el)
      throw new Error("Cannot enable camera panning without binding element")
    this.canPanTouch = true
    return this
  }

  enableMouse() {
    if (!this.el)
      throw new Error("Cannot enable camera panning without binding element")
    this.canPanMouse = true
    if (supportsPointerLock()) this.el.requestPointerLock()
    return this
  }

  setDefault(x, y) {
    updateCamera(this.camera, x, y)
    this.rx = x
    this.ry = y
    return this
  }

  disableTouch() {
    this.canPanTouch = false
    return this
  }

  disableMouse() {
    this.canPanTouch = false
    return this
  }
}

module.exports.ControlCamera = ControlCamera;

class MovementCamera extends ControlCamera {

  direction = new Vector3()

  canMove = true

  constructor(o) {
    super(o)
  }

  onMove = function() {}

  preMove = function(s) {
    return s
  }

  rawMoveUp(s = 0.05) {
    s = this.preMove(s)
    const cameraDirection = new Vector3()
    this.camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0

    const delta = cameraDirection.multiplyScalar(s)
    this.camera.position.add(delta)
    this.onMove()
  }

  moveUp(s = 0.05) {
    s = this.preMove(s)
    const cameraDirection = new Vector3()
    this.camera.getWorldDirection(cameraDirection)
    cameraDirection.y = 0 
    cameraDirection.normalize() 

    const delta = cameraDirection.multiplyScalar(s)
    this.camera.position.add(delta)
    this.onMove()
  }

  moveLeft(s = 0.05) {
    s = this.preMove(s)
    this.camera.translateX(-s)
    this.onMove()
  }

  moveDown(s = 0.05) {
    this.moveUp(-s)
  }

  moveRight(s = 0.05) {
    s = this.preMove(s)
    this.camera.translateX(s)
    this.onMove()
  }

  moveAbove(s = 0.04) {
    s = this.preMove(s)
    this.camera.position.y += s
    this.onMove()
  }

  moveBelow(s = 0.04) {
    this.moveAbove(-s)
  }
}

module.exports.MovementCamera = MovementCamera;