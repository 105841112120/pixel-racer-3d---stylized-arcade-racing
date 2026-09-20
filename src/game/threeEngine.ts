import * as THREE from 'three';
import { soundEngine } from './audioSynth';
import { CameraMode, CarStats, GraphicsQuality, RunStats } from '../types';
import { buildRealisticPlayerCar } from './carBuilder';
import { buildRealisticTrafficVehicle } from './trafficBuilder';

export interface GameEngineCallbacks {
  onScoreUpdate: (stats: RunStats, speedMph: number, nitroPercent: number) => void;
  onNearMiss: (points: number) => void;
  onCollision: (damage: number) => void;
  onGameOver: (finalStats: RunStats) => void;
}

export class ArcadeGameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private callbacks: GameEngineCallbacks;

  // Visual settings
  private quality: GraphicsQuality = 'HIGH';
  private cameraMode: CameraMode = 'NORMAL';

  // Gameplay state
  public isRunning = false;
  public isPaused = false;
  public isGameOver = false;
  private distanceTraveled = 0; // in meters
  private currentSpeedMph = 0;
  private maxSpeedReached = 0;
  private carsPassed = 0;
  private nearMisses = 0;
  private nitroBonusScore = 0;
  private runScore = 0;
  private startTime = 0;

  // Car stats & physics
  public carStats: CarStats;
  private carSpeed = 0; // internal units
  private targetSpeed = 0;
  private carPositionX = 0; // -6.5 to +6.5 road bounds
  private carVelocityX = 0;
  private carSteerAngle = 0;
  private currentHealth = 100;

  // Nitro
  public nitroAmount = 100; // 0 to 100
  public isNitroActive = false;

  // Controls input
  public input = {
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    nitro: false,
  };

  // 3D Objects
  private playerCarGroup = new THREE.Group();
  private carBodyMaterials: THREE.MeshStandardMaterial[] = [];
  private carStripeMaterials: THREE.Material[] = [];
  private wheels: THREE.Mesh[] = [];
  private nitroFlames: THREE.Mesh[] = [];
  private roadSegments: THREE.Group[] = [];
  private trafficPool: Array<{
    group: THREE.Group;
    active: boolean;
    lane: number;
    speed: number;
    type: string;
    passed: boolean;
    nearMissEvaluated: boolean;
  }> = [];

  // VFX
  private speedLinesGroup = new THREE.Group();
  private sparksPool: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }> = [];
  private dustPool: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number }> = [];
  private cameraShakeIntensity = 0;

  // Road configuration
  private readonly LANE_WIDTH = 2.8;
  private readonly ROAD_WIDTH = 13.5;
  private readonly SEGMENT_LENGTH = 70;
  private readonly TOTAL_SEGMENTS = 7;
  private readonly LANES = [-4.2, -1.4, 1.4, 4.2];

  constructor(container: HTMLElement, initialCar: CarStats, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.carStats = initialCar;
    this.callbacks = callbacks;

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd78953); // Stylized desert canyon sky
    this.scene.fog = new THREE.FogExp2(0xd78953, 0.0055);

    // Camera
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.2, 800);
    this.camera.position.set(0, 3.2, -6.5);
    this.camera.lookAt(0, 1.2, 15);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    this.setupLighting();

    // Build World
    this.buildRoadSegments();
    this.buildPlayerCar();
    this.buildTrafficPool();
    this.buildSpeedLines();
    this.buildParticlePools();

    // Listeners
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.75);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3db, 1.25);
    sunLight.position.set(25, 45, -20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    this.scene.add(sunLight);

    const hemisphereLight = new THREE.HemisphereLight(0x7ec0ee, 0xb97a57, 0.4);
    this.scene.add(hemisphereLight);
  }

  // =================== ENVIRONMENT & ROAD ===================
  private buildRoadSegments() {
    for (let i = 0; i < this.TOTAL_SEGMENTS; i++) {
      const segGroup = this.createSegmentMesh(i * this.SEGMENT_LENGTH);
      this.roadSegments.push(segGroup);
      this.scene.add(segGroup);
    }
  }

  private createSegmentMesh(zOffset: number): THREE.Group {
    const group = new THREE.Group();
    group.position.z = zOffset;

    // Road asphalt
    const roadGeo = new THREE.PlaneGeometry(this.ROAD_WIDTH, this.SEGMENT_LENGTH, 1, 1);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x22262c,
      roughness: 0.85,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Shoulder & dirt terrain
    const terrainGeo = new THREE.PlaneGeometry(160, this.SEGMENT_LENGTH, 1, 1);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xb56338, // Warm canyon sandstone
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    terrainMesh.position.y = -0.05;
    terrainMesh.receiveShadow = true;
    group.add(terrainMesh);

    // Road Markings: 3 white dashed lines for 4 lanes
    const dashLength = 4;
    const dashGap = 5;
    const dashesPerSegment = Math.floor(this.SEGMENT_LENGTH / (dashLength + dashGap));
    const laneDividersX = [-2.8, 0, 2.8];

    const dashGeo = new THREE.PlaneGeometry(0.2, dashLength);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xf3f4f6 });

    laneDividersX.forEach((laneX) => {
      for (let d = 0; d < dashesPerSegment; d++) {
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(laneX, 0.01, -this.SEGMENT_LENGTH / 2 + d * (dashLength + dashGap) + dashLength / 2);
        group.add(dash);
      }
    });

    // Solid Edge Lines (Yellow & White)
    const edgeGeo = new THREE.PlaneGeometry(0.3, this.SEGMENT_LENGTH);
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEdge = new THREE.Mesh(edgeGeo, yellowMat);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.position.set(-this.ROAD_WIDTH / 2 + 0.35, 0.01, 0);
    group.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeo, whiteMat);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.position.set(this.ROAD_WIDTH / 2 - 0.35, 0.01, 0);
    group.add(rightEdge);

    // Roadside Guardrails
    const railGeo = new THREE.BoxGeometry(0.25, 0.7, this.SEGMENT_LENGTH);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 });

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-this.ROAD_WIDTH / 2 - 0.3, 0.35, 0);
    leftRail.castShadow = true;
    group.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(this.ROAD_WIDTH / 2 + 0.3, 0.35, 0);
    rightRail.castShadow = true;
    group.add(rightRail);

    // Canyon Cliffs & Stylized Rocks along roadside
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x9c4826,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });

    // Left Canyon Cliff
    const leftCliffGeo = new THREE.DodecahedronGeometry(12, 1);
    leftCliffGeo.scale(1.2, 1.8, 2.5);
    const leftCliff = new THREE.Mesh(leftCliffGeo, rockMat);
    leftCliff.position.set(-28 - Math.random() * 8, 8, (Math.random() - 0.5) * 20);
    leftCliff.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, 0);
    leftCliff.castShadow = true;
    leftCliff.receiveShadow = true;
    group.add(leftCliff);

    // Right Canyon Cliff
    const rightCliffGeo = new THREE.DodecahedronGeometry(14, 1);
    rightCliffGeo.scale(1.4, 2.0, 2.2);
    const rightCliff = new THREE.Mesh(rightCliffGeo, rockMat);
    rightCliff.position.set(30 + Math.random() * 8, 9, (Math.random() - 0.5) * 20);
    rightCliff.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, 0);
    rightCliff.castShadow = true;
    rightCliff.receiveShadow = true;
    group.add(rightCliff);

    // Stylized Desert Cacti / Trees
    for (let t = 0; t < 2; t++) {
      const isLeft = t % 2 === 0;
      const cactusGroup = this.createStylizedCactus();
      cactusGroup.position.set(
        isLeft ? -10 - Math.random() * 5 : 10 + Math.random() * 5,
        0,
        (Math.random() - 0.5) * (this.SEGMENT_LENGTH - 10)
      );
      group.add(cactusGroup);
    }

    // Occasional Overhead Highway Sign Gantry
    if (Math.random() > 0.6) {
      const gantry = this.createOverheadGantry();
      gantry.position.set(0, 0, (Math.random() - 0.5) * 20);
      group.add(gantry);
    }

    return group;
  }

  private createStylizedCactus(): THREE.Group {
    const group = new THREE.Group();
    const cactusMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8, flatShading: true });

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 3, 6), cactusMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);

    // Arm 1
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.4, 6), cactusMat);
    arm1.position.set(0.5, 1.8, 0);
    arm1.rotation.z = Math.PI / 6;
    arm1.castShadow = true;
    group.add(arm1);

    // Arm 2
    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.1, 6), cactusMat);
    arm2.position.set(-0.45, 1.3, 0);
    arm2.rotation.z = -Math.PI / 5;
    arm2.castShadow = true;
    group.add(arm2);

    return group;
  }

  private createOverheadGantry(): THREE.Group {
    const gantry = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });

    // Posts
    const postGeo = new THREE.BoxGeometry(0.4, 5.5, 0.4);
    const leftPost = new THREE.Mesh(postGeo, metalMat);
    leftPost.position.set(-this.ROAD_WIDTH / 2 - 0.8, 2.75, 0);
    leftPost.castShadow = true;
    gantry.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, metalMat);
    rightPost.position.set(this.ROAD_WIDTH / 2 + 0.8, 2.75, 0);
    rightPost.castShadow = true;
    gantry.add(rightPost);

    // Crossbeam
    const beamGeo = new THREE.BoxGeometry(this.ROAD_WIDTH + 2, 0.4, 0.4);
    const beam = new THREE.Mesh(beamGeo, metalMat);
    beam.position.set(0, 5.2, 0);
    beam.castShadow = true;
    gantry.add(beam);

    // Green Signboard
    const signGeo = new THREE.BoxGeometry(6.5, 1.6, 0.15);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.5 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 4.2, 0);
    sign.castShadow = true;
    gantry.add(sign);

    return gantry;
  }

  // =================== PLAYER CAR ===================
  private buildPlayerCar() {
    const built = buildRealisticPlayerCar(this.carStats);
    this.playerCarGroup = built.group;
    this.wheels = built.wheels;
    this.nitroFlames = built.nitroFlames;
    this.carBodyMaterials = built.bodyMaterials;
    this.carStripeMaterials = built.stripeMaterials;

    this.playerCarGroup.position.set(0, 0, 0);
    this.scene.add(this.playerCarGroup);
  }

  public updateCarCustomization(car: CarStats) {
    this.carStats = car;
    this.carBodyMaterials.forEach((mat) => {
      mat.color.set(car.color);
    });
    this.carStripeMaterials.forEach((mat) => {
      if ('color' in mat) {
        (mat as THREE.MeshStandardMaterial).color.set(car.stripeColor);
      }
    });
  }

  // =================== TRAFFIC POOL ===================
  private buildTrafficPool() {
    const POOL_SIZE = 14;
    const colors = [0xdc2626, 0xeab308, 0x2563eb, 0xf8fafc, 0x1e293b, 0x475569, 0x16a34a, 0x9333ea];
    const types = ['sedan', 'sports', 'suv', 'truck', 'van'];

    for (let i = 0; i < POOL_SIZE; i++) {
      const type = types[i % types.length];
      const color = colors[i % colors.length];
      const trafficCar = buildRealisticTrafficVehicle(type, color);

      trafficCar.visible = false;
      this.scene.add(trafficCar);

      this.trafficPool.push({
        group: trafficCar,
        active: false,
        lane: 0,
        speed: 0,
        type,
        passed: false,
        nearMissEvaluated: false,
      });
    }
  }

  // =================== VFX & PARTICLES ===================
  private buildSpeedLines() {
    const count = 60;
    const lineGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 6);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = 0.5 + Math.random() * 4;
      const z = Math.random() * 40;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z + 3.5;
    }

    lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    this.speedLinesGroup.add(lines);
    this.scene.add(this.speedLinesGroup);
  }

  private buildParticlePools() {
    // Collision Sparks
    const sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(sparkGeo, sparkMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.sparksPool.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.4,
      });
    }

    // Tire Dust
    const dustGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const dustMat = new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 25; i++) {
      const mesh = new THREE.Mesh(dustGeo, dustMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.dustPool.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
      });
    }
  }

  private triggerCollisionSparks(x: number, z: number) {
    for (let i = 0; i < 15; i++) {
      const spark = this.sparksPool.find((s) => !s.mesh.visible);
      if (spark) {
        spark.mesh.position.set(x + (Math.random() - 0.5) * 0.5, 0.5 + Math.random() * 0.4, z);
        spark.vel.set((Math.random() - 0.5) * 12, 4 + Math.random() * 6, (Math.random() - 0.5) * 10);
        spark.life = 0;
        spark.maxLife = 0.3 + Math.random() * 0.2;
        spark.mesh.visible = true;
      }
    }
  }

  // =================== GAMEPLAY LIFECYCLE ===================
  public startRace() {
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.distanceTraveled = 0;
    this.currentSpeedMph = 0;
    this.maxSpeedReached = 0;
    this.carsPassed = 0;
    this.nearMisses = 0;
    this.nitroBonusScore = 0;
    this.runScore = 0;
    this.currentHealth = 100;
    this.nitroAmount = 100;
    this.carPositionX = 0;
    this.carVelocityX = 0;
    this.carSpeed = 0;
    this.startTime = performance.now();

    // Reset traffic
    this.trafficPool.forEach((item) => {
      item.active = false;
      item.group.visible = false;
      item.passed = false;
      item.nearMissEvaluated = false;
    });

    soundEngine.startEngine();
    soundEngine.startArcadeMusic();
  }

  public pauseRace() {
    this.isPaused = true;
    soundEngine.stopEngine();
  }

  public resumeRace() {
    this.isPaused = false;
    soundEngine.startEngine();
  }

  public setQuality(q: GraphicsQuality) {
    this.quality = q;
    if (q === 'LOW') {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
    } else if (q === 'MEDIUM') {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = true;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
    }
  }

  public toggleCamera() {
    this.cameraMode = this.cameraMode === 'NORMAL' ? 'CLOSE' : 'NORMAL';
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  // =================== MAIN TICK / LOOP ===================
  public animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = 0.016; // fixed timestep approx 60fps

    if (this.isRunning && !this.isPaused && !this.isGameOver) {
      this.updatePhysics(delta);
      this.updateRoad();
      this.updateTraffic(delta);
      this.updateVFX(delta);
      this.checkCollisions();
    }

    this.updateCamera(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics(delta: number) {
    // 1. Acceleration / Top Speed (Faster & Smoother Arcade Velocity)
    const baseTopMph = (this.carStats.topSpeed || 140) * 1.15; // Tuned for higher excitement
    const accelRate = (this.carStats.acceleration / 100) * 65; // Faster acceleration response

    // Nitro Check
    if (this.input.nitro && this.nitroAmount > 0) {
      this.isNitroActive = true;
      this.nitroAmount = Math.max(0, this.nitroAmount - delta * 20);
      this.targetSpeed = baseTopMph * 1.35; // Thrilling Nitro burst
      this.nitroBonusScore += Math.floor(delta * 90);
      soundEngine.playNitro(true);
    } else {
      this.isNitroActive = false;
      // High cruise baseline when no pedal pressed, top speed when gas pressed
      this.targetSpeed = this.input.accelerate ? baseTopMph : baseTopMph * 0.55;
      // Passive nitro replenishment
      this.nitroAmount = Math.min(100, this.nitroAmount + delta * 4.0);
      soundEngine.playNitro(false);
    }

    if (this.input.brake) {
      this.targetSpeed = 20; // Smooth firm braking
    }

    // Silky-smooth forward speed exponential damping
    const speedDamping = (this.currentSpeedMph < this.targetSpeed)
      ? (this.isNitroActive ? 4.5 : 3.2)
      : 2.8;
    const speedLerpFactor = 1 - Math.exp(-speedDamping * delta);
    this.currentSpeedMph = THREE.MathUtils.lerp(this.currentSpeedMph, this.targetSpeed, speedLerpFactor);
    this.currentSpeedMph = Math.max(0, Math.min(235, this.currentSpeedMph));

    if (this.currentSpeedMph > this.maxSpeedReached) {
      this.maxSpeedReached = Math.round(this.currentSpeedMph);
    }

    // Convert mph to world speed units (increased factor for higher visual rush)
    this.carSpeed = this.currentSpeedMph * 0.62;

    // Distance & Score accrual
    const distanceDelta = (this.carSpeed * delta * 10) / 36;
    this.distanceTraveled += distanceDelta;
    this.runScore += Math.floor(distanceDelta * 3 + (this.currentSpeedMph > 100 ? 5 : 1));

    // 2. Smooth & Responsive Steering (Direction Fixed: Left -> Left, Right -> Right)
    // Camera is at -Z looking toward +Z: +X is screen LEFT, -X is screen RIGHT!
    const maxSteerSpeed = (this.carStats.handling / 100) * 14.0;
    let targetSteerInput = 0;
    if (this.input.left) targetSteerInput += 1;  // +X corresponds to visual LEFT
    if (this.input.right) targetSteerInput -= 1; // -X corresponds to visual RIGHT

    const targetVelocityX = targetSteerInput * maxSteerSpeed;
    // Exponential smoothing for natural vehicle weight and lateral inertia
    const steerDamping = 1 - Math.exp(-11 * delta);
    this.carVelocityX = THREE.MathUtils.lerp(this.carVelocityX, targetVelocityX, steerDamping);
    this.carPositionX += this.carVelocityX * delta;

    // Soft-boundary dampening to prevent jarring snapping
    const maxRoadX = this.ROAD_WIDTH / 2 - 1.25;
    if (this.carPositionX > maxRoadX) {
      this.carPositionX = maxRoadX;
      this.carVelocityX = -this.carVelocityX * 0.25; // Gentle barrier damp
      this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, 0.15);
    } else if (this.carPositionX < -maxRoadX) {
      this.carPositionX = -maxRoadX;
      this.carVelocityX = -this.carVelocityX * 0.25; // Gentle barrier damp
      this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity, 0.15);
    }

    // Silky body roll and yaw smoothly tracking continuous lateral velocity
    const normalizedTurn = maxSteerSpeed > 0 ? (this.carVelocityX / maxSteerSpeed) : 0;
    const targetRoll = normalizedTurn * 0.10; // leans naturally into turn
    const targetYaw = normalizedTurn * 0.16;  // nose smoothly angles into lane shift
    const rotDamping = 1 - Math.exp(-13 * delta);
    this.playerCarGroup.rotation.z = THREE.MathUtils.lerp(this.playerCarGroup.rotation.z, targetRoll, rotDamping);
    this.playerCarGroup.rotation.y = THREE.MathUtils.lerp(this.playerCarGroup.rotation.y, targetYaw, rotDamping);
    this.playerCarGroup.position.x = this.carPositionX;

    // Rotate Wheels
    const wheelRotDelta = (this.carSpeed * delta) / 0.35;
    this.wheels.forEach((w) => {
      w.rotation.x += wheelRotDelta;
    });

    // Sound updates
    soundEngine.updateEnginePitch(this.currentSpeedMph / baseTopMph, this.input.accelerate || this.isNitroActive);

    // Callbacks to React HUD
    const runStats: RunStats = {
      score: this.runScore + this.nitroBonusScore,
      distance: Math.floor(this.distanceTraveled),
      topSpeed: this.maxSpeedReached,
      carsPassed: this.carsPassed,
      nearMisses: this.nearMisses,
      nitroBonus: this.nitroBonusScore,
      timeSurvived: Math.floor((performance.now() - this.startTime) / 1000),
    };
    this.callbacks.onScoreUpdate(runStats, Math.round(this.currentSpeedMph), Math.round(this.nitroAmount));
  }

  private updateRoad() {
    // Scroll road backwards relative to player car speed
    const roadSpeed = this.carSpeed * 0.016;

    this.roadSegments.forEach((segment) => {
      segment.position.z -= roadSpeed;

      // Recycle segment to the far horizon when it goes past camera
      if (segment.position.z < -this.SEGMENT_LENGTH) {
        segment.position.z += this.TOTAL_SEGMENTS * this.SEGMENT_LENGTH;
      }
    });

    // Speedlines translation
    if (this.speedLinesGroup) {
      this.speedLinesGroup.position.z -= roadSpeed * 1.5;
      if (this.speedLinesGroup.position.z < -40) {
        this.speedLinesGroup.position.z = 10;
      }
    }
  }

  private updateTraffic(delta: number) {
    // Spawn traffic ahead periodically
    const activeCount = this.trafficPool.filter((t) => t.active).length;
    if (activeCount < 8 && Math.random() < 0.04) {
      const freeCar = this.trafficPool.find((t) => !t.active);
      if (freeCar) {
        const laneIndex = Math.floor(Math.random() * this.LANES.length);
        const laneX = this.LANES[laneIndex];

        // Ensure no other traffic car is too close in that lane ahead
        const isOccupied = this.trafficPool.some(
          (t) => t.active && Math.abs(t.group.position.x - laneX) < 1.0 && t.group.position.z > 140
        );

        if (!isOccupied) {
          freeCar.active = true;
          freeCar.group.visible = true;
          freeCar.lane = laneIndex;
          freeCar.speed = 30 + Math.random() * 35; // 30-65 mph traffic
          freeCar.passed = false;
          freeCar.nearMissEvaluated = false;
          freeCar.group.position.set(laneX, 0, 180 + Math.random() * 40);
        }
      }
    }

    // Move traffic vehicles
    this.trafficPool.forEach((car) => {
      if (!car.active) return;

      // Traffic relative speed: Player moves faster, traffic moves forward at its own speed
      const relativeSpeed = (car.speed - this.currentSpeedMph) * 0.48;
      car.group.position.z += relativeSpeed * delta;

      // Check if player passed vehicle
      if (!car.passed && car.group.position.z < -1.0) {
        car.passed = true;
        this.carsPassed++;
        this.runScore += 250;
      }

      // Check for Near Miss bonus (Passing vehicle very closely side-by-side)
      if (!car.nearMissEvaluated && Math.abs(car.group.position.z) < 2.5) {
        const lateralDist = Math.abs(car.group.position.x - this.carPositionX);
        if (lateralDist > 1.3 && lateralDist < 2.4 && this.currentSpeedMph > 65) {
          car.nearMissEvaluated = true;
          this.nearMisses++;
          this.nitroAmount = Math.min(100, this.nitroAmount + 25); // Near miss refills nitro!
          this.runScore += 600;
          soundEngine.playNearMiss();
          this.callbacks.onNearMiss(600);
        }
      }

      // Despawn traffic when far behind or excessively far ahead
      if (car.group.position.z < -25 || car.group.position.z > 300) {
        car.active = false;
        car.group.visible = false;
      }
    });
  }

  private checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(this.playerCarGroup);
    // Slightly shrink player box for forgiving arcade hitboxes
    playerBox.min.x += 0.2;
    playerBox.max.x -= 0.2;
    playerBox.min.z += 0.3;
    playerBox.max.z -= 0.3;

    for (const car of this.trafficPool) {
      if (!car.active) continue;

      const trafficBox = new THREE.Box3().setFromObject(car.group);
      trafficBox.min.x += 0.2;
      trafficBox.max.x -= 0.2;

      if (playerBox.intersectsBox(trafficBox)) {
        // Arcade collision hit!
        this.triggerCollisionSparks(this.carPositionX, car.group.position.z);
        soundEngine.playCrash();
        this.cameraShakeIntensity = 0.65;

        // Knock player sideways
        const pushDir = this.carPositionX < car.group.position.x ? -1 : 1;
        this.carPositionX += pushDir * 1.5;

        // Reduce speed significantly
        this.currentSpeedMph = Math.max(25, this.currentSpeedMph * 0.4);

        // Damage & Health check
        this.currentHealth -= 25;
        this.callbacks.onCollision(25);

        // Knock traffic car forward & despawn
        car.group.position.z += 10;
        car.speed += 30;

        if (this.currentHealth <= 0) {
          this.endGame();
        }
        break;
      }
    }
  }

  private endGame() {
    this.isGameOver = true;
    this.isRunning = false;
    soundEngine.stopEngine();
    soundEngine.stopArcadeMusic();

    const finalStats: RunStats = {
      score: this.runScore + this.nitroBonusScore,
      distance: Math.floor(this.distanceTraveled),
      topSpeed: this.maxSpeedReached,
      carsPassed: this.carsPassed,
      nearMisses: this.nearMisses,
      nitroBonus: this.nitroBonusScore,
      timeSurvived: Math.floor((performance.now() - this.startTime) / 1000),
    };
    this.callbacks.onGameOver(finalStats);
  }

  private updateVFX(delta: number) {
    // Nitro Flame visibility
    this.nitroFlames.forEach((flame) => {
      const mat = flame.material as THREE.MeshBasicMaterial;
      mat.opacity = this.isNitroActive ? 0.95 : 0;
      if (this.isNitroActive) {
        flame.scale.y = 0.8 + Math.random() * 0.5;
      }
    });

    // Speed lines opacity based on speed
    const lineMat = (this.speedLinesGroup.children[0] as THREE.LineSegments)?.material as THREE.LineBasicMaterial;
    if (lineMat) {
      const speedRatio = Math.max(0, (this.currentSpeedMph - 70) / 90);
      lineMat.opacity = THREE.MathUtils.lerp(lineMat.opacity, this.isNitroActive ? 0.7 : speedRatio * 0.35, 0.1);
    }

    // Update Sparks
    this.sparksPool.forEach((s) => {
      if (!s.mesh.visible) return;
      s.life += delta;
      if (s.life >= s.maxLife) {
        s.mesh.visible = false;
      } else {
        s.mesh.position.addScaledVector(s.vel, delta);
        s.vel.y -= 18 * delta; // Gravity
      }
    });

    // Camera shake decay
    if (this.cameraShakeIntensity > 0) {
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - delta * 2.2);
    }
  }

  private updateCamera(delta: number) {
    // Camera modes
    const targetY = this.cameraMode === 'NORMAL' ? 3.1 : 2.2;
    const targetZ = this.cameraMode === 'NORMAL' ? -6.8 : -4.8;
    const targetLookZ = this.cameraMode === 'NORMAL' ? 18 : 14;

    // Dynamic FOV increase on high speed & nitro
    const targetFov = 60 + (this.currentSpeedMph / 150) * 12 + (this.isNitroActive ? 6 : 0);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 0.1);
    this.camera.updateProjectionMatrix();

    // Smooth camera chase following car X position
    const smoothX = THREE.MathUtils.lerp(this.camera.position.x, this.carPositionX * 0.65, 0.12);

    // Add camera shake
    const shakeX = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.4;
    const shakeY = (Math.random() - 0.5) * this.cameraShakeIntensity * 0.3;

    this.camera.position.set(smoothX + shakeX, targetY + shakeY, targetZ);
    this.camera.lookAt(this.carPositionX * 0.4, 1.2, targetLookZ);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    soundEngine.stopEngine();
    soundEngine.stopArcadeMusic();
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
