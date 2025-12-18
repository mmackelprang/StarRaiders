import { Vector3D } from './Types';

export interface Camera3D {
  position: Vector3D;
  rotation: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  fov: number;
  nearPlane: number;
  farPlane: number;
  focalLength: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

export class Math3D {
  /**
   * Project a 3D world position to 2D screen coordinates
   */
  static project3DTo2D(
    worldPos: Vector3D,
    camera: Camera3D,
    screenWidth: number,
    screenHeight: number
  ): ProjectedPoint | null {
    // Transform to camera space
    const cameraPos = this.worldToCameraSpace(worldPos, camera);

    // Check if behind camera
    if (cameraPos.z <= camera.nearPlane) {
      return null; // Don't render
    }

    // Check if beyond far plane
    if (cameraPos.z >= camera.farPlane) {
      return null;
    }

    // Perspective projection
    const screenX = (cameraPos.x / cameraPos.z) * camera.focalLength + screenWidth / 2;
    const screenY = (cameraPos.y / cameraPos.z) * camera.focalLength + screenHeight / 2;

    // Calculate scale based on distance
    const scale = camera.focalLength / cameraPos.z;

    return {
      x: screenX,
      y: screenY,
      scale: scale,
      depth: cameraPos.z,
    };
  }

  /**
   * Transform world space coordinates to camera space
   */
  static worldToCameraSpace(worldPos: Vector3D, camera: Camera3D): Vector3D {
    // Translate to camera origin
    const relative: Vector3D = {
      x: worldPos.x - camera.position.x,
      y: worldPos.y - camera.position.y,
      z: worldPos.z - camera.position.z,
    };

    // Rotate by camera rotation
    const rotated = this.rotatePoint(relative, camera.rotation);

    return rotated;
  }

  /**
   * Rotate a point by yaw and pitch
   */
  static rotatePoint(
    point: Vector3D,
    rotation: { pitch: number; yaw: number; roll: number }
  ): Vector3D {
    // Apply yaw (Y-axis rotation)
    const cosYaw = Math.cos(rotation.yaw);
    const sinYaw = Math.sin(rotation.yaw);

    const x1 = point.x * cosYaw - point.z * sinYaw;
    const z1 = point.x * sinYaw + point.z * cosYaw;
    const y1 = point.y;

    // Apply pitch (X-axis rotation)
    const cosPitch = Math.cos(rotation.pitch);
    const sinPitch = Math.sin(rotation.pitch);

    const y2 = y1 * cosPitch - z1 * sinPitch;
    const z2 = y1 * sinPitch + z1 * cosPitch;
    const x2 = x1;

    return { x: x2, y: y2, z: z2 };
  }

  /**
   * Calculate distance between two 3D points
   */
  static distance3D(a: Vector3D, b: Vector3D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Create a default camera
   */
  static createDefaultCamera(): Camera3D {
    return {
      position: { x: 0, y: 0, z: 0 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      fov: 60,
      nearPlane: 1,
      farPlane: 200,
      focalLength: 300, // This controls perspective strength
    };
  }
}
