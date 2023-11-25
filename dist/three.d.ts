import * as THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

declare module THREE {
  export = THREE;
}