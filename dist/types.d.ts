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