import * as THREE from 'three';
import { CarStats } from '../types';

export interface BuiltCarResult {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  nitroFlames: THREE.Mesh[];
  bodyMaterials: THREE.MeshStandardMaterial[];
  stripeMaterials: THREE.Material[];
}

/**
 * Builds a realistic, highly detailed, stylized sports car / supercar model.
 * Replaces primitive box meshes with authentic aerodynamic curves, sculpted fenders,
 * raked greenhouse glass, functional aero splitters, quad exhausts, detailed alloy wheels,
 * brake discs with red calipers, and cockpit interior.
 */
export function buildRealisticPlayerCar(carStats: CarStats): BuiltCarResult {
  const carGroup = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const nitroFlames: THREE.Mesh[] = [];
  const bodyMaterials: THREE.MeshStandardMaterial[] = [];
  const stripeMaterials: THREE.Material[] = [];

  // =================== MATERIALS ===================
  // Primary Car Body Paint (Automotive Clearcoat finish)
  const bodyColor = new THREE.Color(carStats.color || '#00b4d8');
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    metalness: 0.8,
    roughness: 0.2,
    envMapIntensity: 1.5,
  });
  bodyMaterials.push(bodyMat);

  // Carbon Fiber / Dark Aero Splitters & Wing
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.5,
    roughness: 0.35,
  });

  // Dark Chassis Underbody & Wheel Well Liners
  const underbodyMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.9,
    metalness: 0.1,
  });

  // Tinted Automotive Glass (Windshield, Canopy, Windows)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a0f1d,
    roughness: 0.08,
    metalness: 0.92,
    transparent: true,
    opacity: 0.88,
  });

  // Cockpit Interior (Dashboard, Racing Seats, Steering)
  const interiorMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.15,
  });

  // Polished Chrome / Titanium (Exhaust Tips, Badges)
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Honeycomb Intake Mesh (Front Grilles & Side Scoops)
  const grilleMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.95,
    metalness: 0.2,
  });

  // Dual Racing Stripes
  const stripeColor = new THREE.Color(carStats.stripeColor || '#ffffff');
  const stripeMat = new THREE.MeshStandardMaterial({
    color: stripeColor,
    roughness: 0.3,
    metalness: 0.4,
  });
  stripeMaterials.push(stripeMat);

  // Lighting Materials
  const headlightLedMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const headlightDrlMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd }); // Ice blue DRL
  const headlightGlassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.55,
  });
  const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 }); // Vivid Red LED
  const reverseLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // =================== 1. UNDERBODY & CHASSIS ===================
  // Aerodynamic flat undertray protecting bottom of car
  const underbodyGeo = new THREE.BoxGeometry(1.72, 0.14, 4.25);
  const underbody = new THREE.Mesh(underbodyGeo, underbodyMat);
  underbody.position.set(0, 0.24, 0);
  underbody.receiveShadow = true;
  carGroup.add(underbody);

  // =================== 2. LOWER BODY / WAISTLINE ===================
  // Central sculpted lower cabin waist section
  const lowerCabinGeo = new THREE.BoxGeometry(1.68, 0.38, 2.15);
  const lowerCabin = new THREE.Mesh(lowerCabinGeo, bodyMat);
  lowerCabin.position.set(0, 0.46, -0.05);
  lowerCabin.castShadow = true;
  carGroup.add(lowerCabin);

  // Carbon Side Skirts (running between wheels with aerodynamic winglets)
  const skirtLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 2.2), carbonMat);
  skirtLeft.position.set(-0.92, 0.22, 0);
  carGroup.add(skirtLeft);

  const skirtRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 2.2), carbonMat);
  skirtRight.position.set(0.92, 0.22, 0);
  carGroup.add(skirtRight);

  // Side Skirt Aero Winglets (just in front of rear wheels)
  const wingletGeo = new THREE.BoxGeometry(0.04, 0.16, 0.25);
  const wingletLeft = new THREE.Mesh(wingletGeo, carbonMat);
  wingletLeft.position.set(-0.98, 0.28, -0.95);
  carGroup.add(wingletLeft);

  const wingletRight = new THREE.Mesh(wingletGeo, carbonMat);
  wingletRight.position.set(0.98, 0.28, -0.95);
  carGroup.add(wingletRight);

  // Side Air Scoops / Intakes (brake cooling ducts ahead of rear wheels)
  const scoopGeo = new THREE.BoxGeometry(0.14, 0.26, 0.45);
  const leftScoop = new THREE.Mesh(scoopGeo, grilleMat);
  leftScoop.position.set(-0.86, 0.48, -0.68);
  carGroup.add(leftScoop);

  const rightScoop = new THREE.Mesh(scoopGeo, grilleMat);
  rightScoop.position.set(0.86, 0.48, -0.68);
  carGroup.add(rightScoop);

  // =================== 3. SCULPTED HOOD & FRONT NOSE ===================
  // Sculpted Hood: Slopes smoothly down towards the front bumper
  const hoodLength = 1.35;
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.76, 0);
  hoodShape.lineTo(-0.70, hoodLength);
  hoodShape.lineTo(0.70, hoodLength);
  hoodShape.lineTo(0.76, 0);
  hoodShape.closePath();

  const hoodExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.26,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  };
  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, hoodExtrudeSettings);
  hoodGeo.center();
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat);
  hoodMesh.rotation.x = Math.PI / 2 + 0.13; // aerodynamic slope forward
  hoodMesh.position.set(0, 0.65, 1.42);
  hoodMesh.castShadow = true;
  carGroup.add(hoodMesh);

  // Hood Heat Extractor Air Vents (Twin Recessed Black Vents)
  const ventGeo = new THREE.BoxGeometry(0.22, 0.03, 0.35);
  const leftVent = new THREE.Mesh(ventGeo, grilleMat);
  leftVent.rotation.x = 0.13;
  leftVent.position.set(-0.35, 0.74, 1.48);
  carGroup.add(leftVent);

  const rightVent = new THREE.Mesh(ventGeo, grilleMat);
  rightVent.rotation.x = 0.13;
  rightVent.position.set(0.35, 0.74, 1.48);
  carGroup.add(rightVent);

  // Front Nose Bumper Cone
  const noseGeo = new THREE.BoxGeometry(1.64, 0.32, 0.42);
  const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
  noseMesh.position.set(0, 0.46, 2.06);
  noseMesh.castShadow = true;
  carGroup.add(noseMesh);

  // Front Carbon Fiber Splitter (Ground-effect Aero Lip)
  const splitterGeo = new THREE.BoxGeometry(1.82, 0.06, 0.55);
  const splitter = new THREE.Mesh(splitterGeo, carbonMat);
  splitter.position.set(0, 0.20, 2.05);
  splitter.castShadow = true;
  carGroup.add(splitter);

  // Front Center Radiator Air Grille
  const grilleGeo = new THREE.BoxGeometry(1.05, 0.22, 0.1);
  const grille = new THREE.Mesh(grilleGeo, grilleMat);
  grille.position.set(0, 0.38, 2.22);
  carGroup.add(grille);

  // Front Lower Intake Ducts (Brake cooling ducts on left & right)
  const brakeDuctGeo = new THREE.BoxGeometry(0.26, 0.16, 0.1);
  const leftBrakeDuct = new THREE.Mesh(brakeDuctGeo, grilleMat);
  leftBrakeDuct.position.set(-0.66, 0.34, 2.20);
  carGroup.add(leftBrakeDuct);

  const rightBrakeDuct = new THREE.Mesh(brakeDuctGeo, grilleMat);
  rightBrakeDuct.position.set(0.66, 0.34, 2.20);
  carGroup.add(rightBrakeDuct);

  // Front Corner Canards (High-downforce aero dive planes)
  const canardGeo = new THREE.BoxGeometry(0.18, 0.03, 0.22);
  const leftCanard = new THREE.Mesh(canardGeo, carbonMat);
  leftCanard.rotation.set(-0.15, -0.2, 0.15);
  leftCanard.position.set(-0.84, 0.38, 2.05);
  carGroup.add(leftCanard);

  const rightCanard = new THREE.Mesh(canardGeo, carbonMat);
  rightCanard.rotation.set(-0.15, 0.2, -0.15);
  rightCanard.position.set(0.84, 0.38, 2.05);
  carGroup.add(rightCanard);

  // =================== 4. MUSCULAR FLARED FENDERS ===================
  // Front Left & Right Muscular Fenders
  const frontFenderGeo = new THREE.BoxGeometry(0.24, 0.38, 1.15);
  const leftFrontFender = new THREE.Mesh(frontFenderGeo, bodyMat);
  leftFrontFender.position.set(-0.84, 0.58, 1.32);
  leftFrontFender.castShadow = true;
  carGroup.add(leftFrontFender);

  const rightFrontFender = new THREE.Mesh(frontFenderGeo, bodyMat);
  rightFrontFender.position.set(0.84, 0.58, 1.32);
  rightFrontFender.castShadow = true;
  carGroup.add(rightFrontFender);

  // Rear Widebody Haunches (Muscular Supercar Hips)
  const rearFenderGeo = new THREE.BoxGeometry(0.28, 0.44, 1.25);
  const leftRearFender = new THREE.Mesh(rearFenderGeo, bodyMat);
  leftRearFender.position.set(-0.88, 0.60, -1.28);
  leftRearFender.castShadow = true;
  carGroup.add(leftRearFender);

  const rightRearFender = new THREE.Mesh(rearFenderGeo, bodyMat);
  rightRearFender.position.set(0.88, 0.60, -1.28);
  rightRearFender.castShadow = true;
  carGroup.add(rightRearFender);

  // =================== 5. AERODYNAMIC COCKPIT & GREENHOUSE ===================
  // A-Pillars (Framing front windshield in body color)
  const pillarGeo = new THREE.BoxGeometry(0.07, 0.68, 0.08);
  const leftPillar = new THREE.Mesh(pillarGeo, bodyMat);
  leftPillar.rotation.x = -Math.PI / 4.4;
  leftPillar.rotation.z = -0.18;
  leftPillar.position.set(-0.64, 0.92, 0.46);
  carGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, bodyMat);
  rightPillar.rotation.x = -Math.PI / 4.4;
  rightPillar.rotation.z = 0.18;
  rightPillar.position.set(0.64, 0.92, 0.46);
  carGroup.add(rightPillar);

  // Curved Raked Front Windshield
  const windshieldGeo = new THREE.PlaneGeometry(1.24, 0.78);
  const frontWindshield = new THREE.Mesh(windshieldGeo, glassMat);
  frontWindshield.rotation.x = -Math.PI / 4.4;
  frontWindshield.position.set(0, 0.92, 0.48);
  carGroup.add(frontWindshield);

  // Aerodynamic Double-Bubble Sports Roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.60, 0);
  roofShape.lineTo(-0.56, 1.05);
  roofShape.lineTo(0.56, 1.05);
  roofShape.lineTo(0.60, 0);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 0.10,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  });
  roofGeo.center();
  const roofMesh = new THREE.Mesh(roofGeo, bodyMat);
  roofMesh.rotation.x = Math.PI / 2;
  roofMesh.position.set(0, 1.18, -0.22);
  roofMesh.castShadow = true;
  carGroup.add(roofMesh);

  // Fastback Rear Windshield / Sloped Engine Cover Glass
  const rearGlassGeo = new THREE.PlaneGeometry(1.18, 0.88);
  const rearWindshield = new THREE.Mesh(rearGlassGeo, glassMat);
  rearWindshield.rotation.x = Math.PI / 5.0;
  rearWindshield.rotation.y = Math.PI;
  rearWindshield.position.set(0, 0.95, -0.98);
  carGroup.add(rearWindshield);

  // Aerodynamic Side Windows
  const sideWindowGeo = new THREE.PlaneGeometry(1.28, 0.36);
  const leftWindow = new THREE.Mesh(sideWindowGeo, glassMat);
  leftWindow.rotation.y = -Math.PI / 2;
  leftWindow.position.set(-0.67, 0.98, -0.15);
  carGroup.add(leftWindow);

  const rightWindow = new THREE.Mesh(sideWindowGeo, glassMat);
  rightWindow.rotation.y = Math.PI / 2;
  rightWindow.position.set(0.67, 0.98, -0.15);
  carGroup.add(rightWindow);

  // Cockpit Interior Details (Visible through clear/tinted glass)
  // Dashboard
  const dashGeo = new THREE.BoxGeometry(1.22, 0.22, 0.42);
  const dash = new THREE.Mesh(dashGeo, interiorMat);
  dash.position.set(0, 0.74, 0.42);
  carGroup.add(dash);

  // Sport Steering Wheel
  const wheelRimGeo = new THREE.TorusGeometry(0.12, 0.024, 8, 16);
  const steeringWheel = new THREE.Mesh(wheelRimGeo, interiorMat);
  steeringWheel.rotation.x = Math.PI / 3.5;
  steeringWheel.position.set(-0.32, 0.84, 0.25);
  carGroup.add(steeringWheel);

  // Racing Bucket Seats (Left Driver & Right Passenger)
  const seatBaseGeo = new THREE.BoxGeometry(0.38, 0.16, 0.42);
  const seatBackGeo = new THREE.BoxGeometry(0.36, 0.48, 0.14);
  const headrestGeo = new THREE.BoxGeometry(0.22, 0.14, 0.12);

  [-0.32, 0.32].forEach((xPos) => {
    const seatBase = new THREE.Mesh(seatBaseGeo, interiorMat);
    seatBase.position.set(xPos, 0.52, -0.15);
    carGroup.add(seatBase);

    const seatBack = new THREE.Mesh(seatBackGeo, interiorMat);
    seatBack.rotation.x = -0.18;
    seatBack.position.set(xPos, 0.82, -0.36);
    carGroup.add(seatBack);

    const headrest = new THREE.Mesh(headrestGeo, interiorMat);
    headrest.position.set(xPos, 1.05, -0.42);
    carGroup.add(headrest);
  });

  // Aerodynamic Winglet Side Mirrors
  const mirrorStalkGeo = new THREE.BoxGeometry(0.12, 0.04, 0.06);
  const mirrorHousingGeo = new THREE.BoxGeometry(0.20, 0.11, 0.12);
  const mirrorFaceGeo = new THREE.PlaneGeometry(0.17, 0.09);

  // Left Mirror
  const leftMirrorStalk = new THREE.Mesh(mirrorStalkGeo, carbonMat);
  leftMirrorStalk.position.set(-0.76, 0.78, 0.42);
  carGroup.add(leftMirrorStalk);

  const leftMirrorHousing = new THREE.Mesh(mirrorHousingGeo, bodyMat);
  leftMirrorHousing.position.set(-0.86, 0.81, 0.42);
  carGroup.add(leftMirrorHousing);

  const leftMirrorFace = new THREE.Mesh(mirrorFaceGeo, chromeMat);
  leftMirrorFace.rotation.y = Math.PI;
  leftMirrorFace.position.set(-0.86, 0.81, 0.36);
  carGroup.add(leftMirrorFace);

  // Right Mirror
  const rightMirrorStalk = new THREE.Mesh(mirrorStalkGeo, carbonMat);
  rightMirrorStalk.position.set(0.76, 0.78, 0.42);
  carGroup.add(rightMirrorStalk);

  const rightMirrorHousing = new THREE.Mesh(mirrorHousingGeo, bodyMat);
  rightMirrorHousing.position.set(0.86, 0.81, 0.42);
  carGroup.add(rightMirrorHousing);

  const rightMirrorFace = new THREE.Mesh(mirrorFaceGeo, chromeMat);
  rightMirrorFace.position.set(0.86, 0.81, 0.36);
  carGroup.add(rightMirrorFace);

  // =================== 6. REAR DECK, DIFFUSER & EXHAUSTS ===================
  // Rear Decklid (sloping down to taillights)
  const decklidGeo = new THREE.BoxGeometry(1.60, 0.32, 0.75);
  const decklid = new THREE.Mesh(decklidGeo, bodyMat);
  decklid.position.set(0, 0.64, -1.68);
  decklid.castShadow = true;
  carGroup.add(decklid);

  // Rear Fascia Bumper Box
  const rearBumperGeo = new THREE.BoxGeometry(1.72, 0.38, 0.32);
  const rearBumper = new THREE.Mesh(rearBumperGeo, bodyMat);
  rearBumper.position.set(0, 0.48, -2.06);
  rearBumper.castShadow = true;
  carGroup.add(rearBumper);

  // Rear Aerodynamic Carbon Diffuser
  const diffuserGeo = new THREE.BoxGeometry(1.68, 0.18, 0.48);
  const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
  diffuser.position.set(0, 0.22, -2.12);
  diffuser.castShadow = true;
  carGroup.add(diffuser);

  // Diffuser Vertical Aero Fins (4 aerodynamic guide strakes)
  [-0.45, -0.15, 0.15, 0.45].forEach((xFin) => {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.44), carbonMat);
    fin.position.set(xFin, 0.22, -2.14);
    carGroup.add(fin);
  });

  // Quad Titanium / Stainless Exhaust Pipes (2 Left, 2 Right)
  const exhaustOuterGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.24, 16);
  exhaustOuterGeo.rotateX(Math.PI / 2);
  const exhaustInnerGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.25, 16);
  exhaustInnerGeo.rotateX(Math.PI / 2);

  const exhaustPositions = [
    [-0.52, 0.34, -2.25], // Outer Left
    [-0.38, 0.34, -2.25], // Inner Left
    [0.38, 0.34, -2.25],  // Inner Right
    [0.52, 0.34, -2.25],  // Outer Right
  ];

  exhaustPositions.forEach(([exX, exY, exZ]) => {
    const pipeOuter = new THREE.Mesh(exhaustOuterGeo, chromeMat);
    pipeOuter.position.set(exX, exY, exZ);
    carGroup.add(pipeOuter);

    const pipeInner = new THREE.Mesh(exhaustInnerGeo, underbodyMat);
    pipeInner.position.set(exX, exY, exZ - 0.01);
    carGroup.add(pipeInner);
  });

  // =================== 7. GT REAR SPOILER / WING ===================
  // Curved aerofoil high-downforce rear wing
  const wingWidth = 1.74;
  const wingChord = 0.32;
  const wingGeo = new THREE.BoxGeometry(wingWidth, 0.05, wingChord);
  const wing = new THREE.Mesh(wingGeo, carbonMat);
  wing.position.set(0, 1.10, -1.95);
  wing.rotation.x = 0.05; // slight angle of attack
  wing.castShadow = true;
  carGroup.add(wing);

  // Wing Aerodynamic Vertical Endplates
  const endplateGeo = new THREE.BoxGeometry(0.03, 0.18, 0.36);
  const leftEndplate = new THREE.Mesh(endplateGeo, carbonMat);
  leftEndplate.position.set(-wingWidth / 2 - 0.01, 1.10, -1.95);
  carGroup.add(leftEndplate);

  const rightEndplate = new THREE.Mesh(endplateGeo, carbonMat);
  rightEndplate.position.set(wingWidth / 2 + 0.01, 1.10, -1.95);
  carGroup.add(rightEndplate);

  // Dual Aluminum Swan-Neck Spoiler Mounting Struts
  const strutGeo = new THREE.BoxGeometry(0.05, 0.38, 0.08);
  const leftStrut = new THREE.Mesh(strutGeo, chromeMat);
  leftStrut.rotation.x = -0.18;
  leftStrut.position.set(-0.52, 0.92, -1.92);
  carGroup.add(leftStrut);

  const rightStrut = new THREE.Mesh(strutGeo, chromeMat);
  rightStrut.rotation.x = -0.18;
  rightStrut.position.set(0.52, 0.92, -1.92);
  carGroup.add(rightStrut);

  // =================== 8. LIGHTING SYSTEMS ===================
  // Modern Swept-Back LED Projector Headlights
  [-0.64, 0.64].forEach((xLight) => {
    const isLeft = xLight < 0;
    // Outer glass casing
    const casing = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.36), headlightGlassMat);
    casing.rotation.y = isLeft ? -0.15 : 0.15;
    casing.position.set(xLight, 0.62, 2.06);
    carGroup.add(casing);

    // Twin LED Projector Bulbs
    [-0.07, 0.07].forEach((xOffset) => {
      const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.08, 12), headlightLedMat);
      bulb.rotateX(Math.PI / 2);
      bulb.position.set(xLight + xOffset, 0.62, 2.14);
      carGroup.add(bulb);
    });

    // Daytime Running Light (DRL) Accent Line
    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.024, 0.04), headlightDrlMat);
    drl.position.set(xLight, 0.68, 2.16);
    carGroup.add(drl);
  });

  // Rear Continuous LED Taillight Bar & Cluster
  const lightBarGeo = new THREE.BoxGeometry(1.58, 0.065, 0.06);
  const lightBar = new THREE.Mesh(lightBarGeo, taillightMat);
  lightBar.position.set(0, 0.64, -2.23);
  carGroup.add(lightBar);

  // Outer L-shaped Taillight Clusters
  [-0.68, 0.68].forEach((xTail) => {
    const tailCluster = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.08), taillightMat);
    tailCluster.position.set(xTail, 0.62, -2.22);
    carGroup.add(tailCluster);

    // Integrated Reverse Light Insert
    const revLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.09), reverseLightMat);
    revLight.position.set(xTail > 0 ? xTail - 0.06 : xTail + 0.06, 0.60, -2.22);
    carGroup.add(revLight);
  });

  // =================== 9. DUAL RACING STRIPES ===================
  // Dual Racing Stripes conforming over Hood, Roof, and Rear Decklid
  const stripeWidth = 0.16;
  const stripeSpacing = 0.12;

  [-stripeSpacing, stripeSpacing].forEach((xStripe) => {
    // Hood Stripe
    const stripeHood = new THREE.Mesh(new THREE.PlaneGeometry(stripeWidth, 1.35), stripeMat);
    stripeHood.rotation.x = -Math.PI / 2 + 0.13;
    stripeHood.position.set(xStripe, 0.79, 1.42);
    carGroup.add(stripeHood);

    // Roof Stripe
    const stripeRoof = new THREE.Mesh(new THREE.PlaneGeometry(stripeWidth, 1.05), stripeMat);
    stripeRoof.rotation.x = -Math.PI / 2;
    stripeRoof.position.set(xStripe, 1.25, -0.22);
    carGroup.add(stripeRoof);

    // Rear Decklid Stripe
    const stripeDeck = new THREE.Mesh(new THREE.PlaneGeometry(stripeWidth, 0.72), stripeMat);
    stripeDeck.rotation.x = -Math.PI / 2 - 0.10;
    stripeDeck.position.set(xStripe, 0.81, -1.68);
    carGroup.add(stripeDeck);
  });

  // =================== 10. REALISTIC HIGH-PERFORMANCE WHEELS ===================
  // 4 Wheel assemblies with rubber tires, 10-spoke forged alloy rims, drilled brake discs & red Brembo calipers
  const wheelPositions = [
    [-0.94, 0.34, 1.32],  // Front Left
    [0.94, 0.34, 1.32],   // Front Right
    [-0.96, 0.34, -1.30], // Rear Left (slightly wider rear track for aggressive stance)
    [0.96, 0.34, -1.30],  // Rear Right
  ];

  // Tire Geometry: Chamfered racing tire
  const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.28, 24);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x171717,
    roughness: 0.88,
    metalness: 0.08,
  });

  // Rim Lip & Barrel
  const rimBarrelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.30, 24);
  rimBarrelGeo.rotateZ(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.90,
    roughness: 0.16,
  });

  // Center Hub & Lug Nuts
  const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.31, 16);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.2,
  });

  // Ventilated Drilled Brake Disc Rotor
  const discGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 20);
  discGeo.rotateZ(Math.PI / 2);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xa1a1aa,
    metalness: 0.92,
    roughness: 0.22,
  });

  // Performance Racing Brake Caliper (Brembo Red)
  const caliperGeo = new THREE.BoxGeometry(0.08, 0.15, 0.11);
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.45,
    roughness: 0.28,
  });

  wheelPositions.forEach(([wx, wy, wz]) => {
    const isLeft = wx < 0;
    const wheelAssembly = new THREE.Group();
    wheelAssembly.position.set(wx, wy, wz);

    // Rotating Wheel Node (Tire + Rims + Spokes + Hub)
    const rotatingWheel = new THREE.Group();

    // Tire
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    rotatingWheel.add(tire);

    // Rim Outer Barrel
    const rimBarrel = new THREE.Mesh(rimBarrelGeo, rimMat);
    rotatingWheel.add(rimBarrel);

    // Center Hub
    const hub = new THREE.Mesh(hubGeo, hubMat);
    rotatingWheel.add(hub);

    // 5 Twin-Spokes (10 Spokes Total) with Forged Alloy Styling
    const spokeCount = 10;
    const spokeGeo = new THREE.BoxGeometry(0.042, 0.22, 0.024);
    for (let s = 0; s < spokeCount; s++) {
      const angle = (s * Math.PI * 2) / spokeCount;
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      // Position along the radius
      spoke.position.set(
        isLeft ? -0.13 : 0.13,
        Math.cos(angle) * 0.12,
        Math.sin(angle) * 0.12
      );
      spoke.rotation.x = -angle;
      rotatingWheel.add(spoke);
    }

    wheelAssembly.add(rotatingWheel);
    wheels.push(tire); // The engine rotates wheels by incrementing rotation.x on these meshes

    // Stationary Brake Assembly (Rotor & Caliper stay fixed while wheel spins)
    const brakeGroup = new THREE.Group();
    const brakeDisc = new THREE.Mesh(discGeo, discMat);
    brakeDisc.position.x = isLeft ? 0.03 : -0.03;
    brakeGroup.add(brakeDisc);

    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isLeft ? 0.03 : -0.03, 0.12, 0.08);
    brakeGroup.add(caliper);

    wheelAssembly.add(brakeGroup);
    carGroup.add(wheelAssembly);
  });

  // =================== 11. NITRO EXHAUST FLAMES ===================
  // Dual Nitro Cones aligned with the inner exhaust tips
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Electric Blue Nitro Flame
    transparent: true,
    opacity: 0,
  });
  const flameGeo = new THREE.ConeGeometry(0.12, 0.95, 12);
  flameGeo.rotateX(-Math.PI / 2);

  [-0.38, 0.38].forEach((flameX) => {
    const flame = new THREE.Mesh(flameGeo, flameMat.clone());
    flame.position.set(flameX, 0.34, -2.42);
    carGroup.add(flame);
    nitroFlames.push(flame);
  });

  // =================== 12. GROUND SHADOW ===================
  // Soft ambient contact shadow under the car chassis
  const shadowGeo = new THREE.PlaneGeometry(2.15, 4.45);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.5,
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(0, 0.02, 0);
  carGroup.add(shadowPlane);

  return {
    group: carGroup,
    wheels,
    nitroFlames,
    bodyMaterials,
    stripeMaterials,
  };
}
