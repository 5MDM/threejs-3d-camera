import Three3DCamera from "./index"
if (!window.THREE) throw new Error("threejs-3d-camera requires three.js to be loaded first")
const {Quaternion, Vector3, PerspectiveCamera} = window.THREE

export default Three3DCamera(Quaternion, Vector3, PerspectiveCamera)