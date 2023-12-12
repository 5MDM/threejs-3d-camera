import {ControlCamera as _ControlCamera, MovementCamera as _MovementCamera} from "./index"
import * as THREE from "three"

/**
 * A class that controls the camera quaternion and rotation from pointer events
 */
export class ControlCamera extends _ControlCamera {
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
  constructor(o: {
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fov?: number,
    min?: number,
    max?: number,
    mouseSensitivity?: number,
  }) {
    super(o, {...THREE})
  }
}
/**
 * A class that extends the {@link ControlCamera} class and adds movement functionality
 */
export class MovementCamera extends _MovementCamera {
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
  constructor(o: {
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fov?: number,
    min?: number,
    max?: number,
    mouseSensitivity?: number,
  }) {
    super(o, {...THREE})
  }
}