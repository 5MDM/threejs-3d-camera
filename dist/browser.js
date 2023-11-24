"use strict";
var Three3DCamera = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/browser.ts
  var browser_exports = {};
  __export(browser_exports, {
    default: () => browser_default
  });

  // src/index.ts
  var RADIAN_HALF = 1.570796;
  function clamp(min, num, max) {
    return Math.min(Math.max(num, min), max);
  }
  function supportsPointerLock() {
    return "pointerLockElement" in document;
  }
  var src_default = function(Quaternion2, Vector32, PerspectiveCamera2) {
    function newCamera(o) {
      return new PerspectiveCamera2(
        o.fov || 80,
        o.width / o.height,
        o.min || 0.1,
        o.max || 1e3
      );
    }
    function setQuaternion(mathX, mathY) {
      const qx = new Quaternion2();
      qx.setFromAxisAngle(new Vector32(0, 1, 0), mathX);
      const qz = new Quaternion2();
      qz.setFromAxisAngle(new Vector32(1, 0, 0), mathY);
      return { qx, qz };
    }
    function updateCamera(cam, mathX, mathY) {
      const { qx, qz } = setQuaternion(mathX, mathY);
      const q = new Quaternion2();
      q.multiply(qx);
      q.multiply(qz);
      cam.quaternion.copy(q);
    }
    class ControlCamera {
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
       */
      constructor(o) {
        /**
         * The angle in radians for the x-axis rotation
         */
        __publicField(this, "rx", RADIAN_HALF);
        /**
         * The angle in radians for the y-axis rotation
         */
        __publicField(this, "ry", -RADIAN_HALF);
        /**
         * A boolean flag that indicates whether the camera can pan using touch controls or not
         */
        __publicField(this, "canPanTouch", false);
        /**
         * A boolean flag that indicates whether the camera can pan using mouse controls or not
         */
        __publicField(this, "canPanMouse", false);
        /**
         * The mouse sensitivity for camera panning
         */
        __publicField(this, "mouseSensitivity", 100);
        /**
         * The PerspectiveCamera that this camera uses
         */
        __publicField(this, "camera");
        /**
         * The canvas element the camera is bound to
         */
        __publicField(this, "canvas");
        /**
         * An object that stores the touch information
         */
        __publicField(this, "touch", {
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
        });
        /**
         * A function that gets called on the pointer move event
         */
        __publicField(this, "onPointerMove", (_e) => {
        });
        /**
         * A function that gets called when the pointer gets unlocked
         */
        __publicField(this, "onPointerUnlock", () => {
        });
        if (window == void 0)
          console.warn("threejs-3d-camera should only be used in the browser");
        this.camera = newCamera(o);
        this.mouseSensitivity = (o == null ? void 0 : o.mouseSensitivity) || 100;
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
        el.addEventListener("pointerdown", (e) => this.down(e));
        el.addEventListener("touchmove", (e) => {
          e.preventDefault();
          this.moveTouch(e.targetTouches[e.targetTouches.length - 1]);
        });
        el.addEventListener("pointerup", (e) => this.up(e));
        el.addEventListener("mousemove", (e) => {
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
        this.rx -= dx * (5e-3 * this.mouseSensitivity / 100);
        this.ry = clamp(
          -Math.PI / 2 + 0.1,
          this.ry - dy * (5e-3 * this.mouseSensitivity / 100),
          Math.PI / 3
        );
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
    class MovementCamera extends ControlCamera {
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
       */
      constructor(o) {
        super(o);
        /**
         * The direction vector for the camera movement
         */
        __publicField(this, "direction", new Vector32());
        /**
         * A boolean flag that indicates whether the camera can move or not
         */
        __publicField(this, "canMove", true);
        /**
         * A function that handles the camera movement event
         */
        __publicField(this, "onMove", function() {
        });
        /**
         * A function that modifies the movement speed before applying it
         * @param s - The movement speed
         * @returns The modified movement speed
         */
        __publicField(this, "preMove", function(s) {
          return s;
        });
      }
      /**
       * Moves the camera forward directly, including the y-axis
       * @param [s=0.05] - The movement speed
       */
      rawMoveForward(s = 0.05) {
        s = this.preMove(s);
        const cameraDirection = new Vector32();
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
        const cameraDirection = new Vector32();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
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
    return {
      ControlCamera,
      MovementCamera
    };
  };

  // src/browser.ts
  if (!window.THREE)
    throw new Error("threejs-3d-camera requires three.js to be loaded first");
  var { Quaternion, Vector3, PerspectiveCamera } = window.THREE;
  var browser_default = src_default(Quaternion, Vector3, PerspectiveCamera);
  return __toCommonJS(browser_exports);
})();
