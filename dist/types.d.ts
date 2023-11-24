import * as THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

declare module THREE {
  export = THREE;
}

export class ControlCamera {
  constructor(o: {
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fov?: number,
    min?: number,
    max?: number,
    mouseSensitivity?: number,
  })
}
export class MovementCamera {
  constructor(o: {
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fov?: number,
    min?: number,
    max?: number,
    mouseSensitivity?: number,
  })
}