import * as THREE from 'three';

/**
 * Builds realistic, stylized 3D traffic vehicles to replace primitive box cars on the highway.
 * Generates authentic models for sedans, sports coupes, SUVs, cargo semi-trucks, and delivery vans.
 */

// Helper to create detailed automotive wheels
function createWheel(
  radius: number,
  width: number,
  tireMat: THREE.Material,
  rimMat: THREE.Material,
  hubMat: THREE.Material,
  spokeCount = 6,
  isHeavyDuty = false
): THREE.Group {
  const wheelGroup = new THREE.Group();

  // Rubber Tire
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, isHeavyDuty ? 16 : 20);
  tireGeo.rotateZ(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.castShadow = true;
  wheelGroup.add(tire);

  // Wheel Rim Lip
  const rimRadius = radius * (isHeavyDuty ? 0.6 : 0.68);
  const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.01, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, rimMat);
  wheelGroup.add(rim);

  // Center Hub
  const hubGeo = new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, width + 0.02, 12);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, hubMat);
  wheelGroup.add(hub);

  // Spokes
  const spokeGeo = new THREE.BoxGeometry(width * 0.95, radius * 0.42, radius * 0.08);
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * Math.PI) / spokeCount;
    const spoke = new THREE.Mesh(spokeGeo, rimMat);
    spoke.position.set(0, 0, 0);
    spoke.rotation.x = angle;
    wheelGroup.add(spoke);
  }

  return wheelGroup;
}

// ==========================================
// 1. REALISTIC SEDAN (Modern Executive Sedan)
// ==========================================
function buildSedan(color: number): THREE.Group {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.68,
    roughness: 0.28,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.2 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.06, metalness: 0.92, transparent: true, opacity: 0.88 });
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.85, roughness: 0.2 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5 });

  // Chassis Underbody
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.12, 4.2), trimMat);
  chassis.position.set(0, 0.22, 0);
  car.add(chassis);

  // Main Lower Body (Front bumper to Rear bumper)
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.38, 4.15), bodyMat);
  lowerBody.position.set(0, 0.45, 0);
  lowerBody.castShadow = true;
  car.add(lowerBody);

  // Sloping Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.20, 1.25), bodyMat);
  hood.position.set(0, 0.62, 1.35);
  hood.rotation.x = 0.08;
  hood.castShadow = true;
  car.add(hood);

  // Front Grille & Air Dam
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 0.08), trimMat);
  grille.position.set(0, 0.42, 2.08);
  car.add(grille);

  const grilleTrim = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.04, 0.09), chromeMat);
  grilleTrim.position.set(0, 0.53, 2.08);
  car.add(grilleTrim);

  // Headlights
  [-0.66, 0.66].forEach((x) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.13, 0.12), lightMat);
    light.position.set(x, 0.52, 2.05);
    car.add(light);
  });

  // Greenhouse / Cabin
  // Windshield
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.72), glassMat);
  windshield.rotation.x = -Math.PI / 3.8;
  windshield.position.set(0, 0.88, 0.52);
  car.add(windshield);

  // A-Pillars
  [-0.68, 0.68].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.68, 0.06), bodyMat);
    pillar.rotation.x = -Math.PI / 3.8;
    pillar.position.set(x, 0.88, 0.52);
    car.add(pillar);
  });

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.08, 1.35), bodyMat);
  roof.position.set(0, 1.15, -0.25);
  roof.castShadow = true;
  car.add(roof);

  // Rear Windshield
  const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.70), glassMat);
  rearGlass.rotation.x = Math.PI / 3.8;
  rearGlass.rotation.y = Math.PI;
  rearGlass.position.set(0, 0.88, -1.02);
  car.add(rearGlass);

  // Side Windows
  [-0.70, 0.70].forEach((x) => {
    const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.36), glassMat);
    sideGlass.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    sideGlass.position.set(x, 0.94, -0.25);
    car.add(sideGlass);

    // B-Pillar
    const bPillar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.38, 0.08), trimMat);
    bPillar.position.set(x, 0.94, -0.22);
    car.add(bPillar);

    // Side Mirrors
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.12), bodyMat);
    mirror.position.set(x > 0 ? x + 0.12 : x - 0.12, 0.74, 0.46);
    car.add(mirror);
  });

  // Trunk Decklid
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.18, 0.85), bodyMat);
  trunk.position.set(0, 0.61, -1.62);
  trunk.castShadow = true;
  car.add(trunk);

  // Taillights
  [-0.64, 0.64].forEach((x) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.08), tailMat);
    tail.position.set(x, 0.54, -2.08);
    car.add(tail);
  });

  // Rear Lightbar
  const lightbar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.06), tailMat);
  lightbar.position.set(0, 0.57, -2.08);
  car.add(lightbar);

  // Chrome Exhaust Tip
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 12), chromeMat);
  exhaust.rotateX(Math.PI / 2);
  exhaust.position.set(0.55, 0.30, -2.12);
  car.add(exhaust);

  // 4 Wheels
  const wheelPositions = [
    [-0.90, 0.32, 1.25],
    [0.90, 0.32, 1.25],
    [-0.90, 0.32, -1.25],
    [0.90, 0.32, -1.25],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const w = createWheel(0.32, 0.24, tireMat, rimMat, hubMat, 5);
    w.position.set(wx, wy, wz);
    car.add(w);
  });

  // Ground Shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.05, 4.3),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  car.add(shadow);

  return car;
}

// ==========================================
// 2. REALISTIC SPORTS COUPE (Low-slung GT)
// ==========================================
function buildSportsCoupe(color: number): THREE.Group {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.8,
    roughness: 0.22,
  });
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.9 });
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const drlMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.88 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.9, roughness: 0.18 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6 }); // Red center lock
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });

  // Chassis Underbody
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.10, 4.2), carbonMat);
  chassis.position.set(0, 0.18, 0);
  car.add(chassis);

  // Front Carbon Aero Splitter Lip
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.05, 0.48), carbonMat);
  splitter.position.set(0, 0.18, 2.05);
  car.add(splitter);

  // Lower Body Sculpted
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.32, 4.1), bodyMat);
  lowerBody.position.set(0, 0.38, 0);
  lowerBody.castShadow = true;
  car.add(lowerBody);

  // Flared Rear Wheel Haunches (Wider Stance)
  [-0.88, 0.88].forEach((x) => {
    const haunch = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 1.35), bodyMat);
    haunch.position.set(x, 0.48, -1.15);
    haunch.castShadow = true;
    car.add(haunch);
  });

  // Long Sloping Aerodynamic Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.18, 1.42), bodyMat);
  hood.rotation.x = 0.12;
  hood.position.set(0, 0.56, 1.32);
  hood.castShadow = true;
  car.add(hood);

  // Hood Air Vents
  [-0.34, 0.34].forEach((x) => {
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.28), carbonMat);
    vent.rotation.x = 0.12;
    vent.position.set(x, 0.64, 1.38);
    car.add(vent);
  });

  // Aggressive Front Radiator Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.22, 0.1), carbonMat);
  grille.position.set(0, 0.34, 2.08);
  car.add(grille);

  // Angled Headlights with DRL Eyebrows
  [-0.65, 0.65].forEach((x) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.14), lightMat);
    light.rotation.y = x > 0 ? 0.16 : -0.16;
    light.position.set(x, 0.48, 2.04);
    car.add(light);

    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.02, 0.04), drlMat);
    drl.position.set(x, 0.54, 2.10);
    car.add(drl);
  });

  // Cockpit / Fastback Greenhouse
  // Low Raked Windshield
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.82), glassMat);
  windshield.rotation.x = -Math.PI / 3.4;
  windshield.position.set(0, 0.82, 0.44);
  car.add(windshield);

  // Fastback Canopy Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.08, 1.15), bodyMat);
  roof.position.set(0, 1.05, -0.22);
  roof.castShadow = true;
  car.add(roof);

  // Sloping Fastback Rear Glass
  const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 0.94), glassMat);
  rearGlass.rotation.x = Math.PI / 4.4;
  rearGlass.rotation.y = Math.PI;
  rearGlass.position.set(0, 0.80, -0.96);
  car.add(rearGlass);

  // Side Windows
  [-0.65, 0.65].forEach((x) => {
    const sideGlass = new THREE.PlaneGeometry(1.15, 0.30);
    const w = new THREE.Mesh(sideGlass, glassMat);
    w.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    w.position.set(x, 0.86, -0.20);
    car.add(w);

    // Carbon Wing Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.1), carbonMat);
    mirror.position.set(x > 0 ? x + 0.12 : x - 0.12, 0.68, 0.38);
    car.add(mirror);
  });

  // Short Rear Decklid with Ducktail Spoiler
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.16, 0.68), bodyMat);
  deck.position.set(0, 0.55, -1.65);
  deck.castShadow = true;
  car.add(deck);

  const ducktail = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 0.18), carbonMat);
  ducktail.rotation.x = -0.25;
  ducktail.position.set(0, 0.65, -1.98);
  ducktail.castShadow = true;
  car.add(ducktail);

  // Continuous Rear LED Lightbar
  const lightbar = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.05, 0.06), tailMat);
  lightbar.position.set(0, 0.54, -2.06);
  car.add(lightbar);

  // Rear Diffuser with Quad Exhausts
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.15, 0.35), carbonMat);
  diffuser.position.set(0, 0.19, -2.02);
  car.add(diffuser);

  [-0.48, -0.36, 0.36, 0.48].forEach((x) => {
    const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), chromeMat);
    ex.rotateX(Math.PI / 2);
    ex.position.set(x, 0.24, -2.12);
    car.add(ex);
  });

  // 4 Low-Profile Sports Wheels
  const wheelPositions = [
    [-0.92, 0.30, 1.28],
    [0.92, 0.30, 1.28],
    [-0.95, 0.30, -1.25], // Wider rear stance
    [0.95, 0.30, -1.25],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const w = createWheel(0.30, 0.26, tireMat, rimMat, hubMat, 5);
    w.position.set(wx, wy, wz);
    car.add(w);
  });

  // Ground Shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 4.35),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  car.add(shadow);

  return car;
}

// ==========================================
// 3. REALISTIC SUV / CROSSOVER (High-Riding)
// ==========================================
function buildSUV(color: number): THREE.Group {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.65,
    roughness: 0.3,
  });
  const claddingMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.1 });
  const skidPlateMat = new THREE.MeshStandardMaterial({ color: 0xc4cbd4, metalness: 0.7, roughness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.06, metalness: 0.9, transparent: true, opacity: 0.88 });
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const fogMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.92 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.22 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.15 });

  // Lower Rugged Black Cladding (Perimeter)
  const cladding = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.25, 4.35), claddingMat);
  cladding.position.set(0, 0.30, 0);
  car.add(cladding);

  // Front & Rear Silver Skid Plates
  const frontSkid = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.14, 0.2), skidPlateMat);
  frontSkid.position.set(0, 0.26, 2.18);
  car.add(frontSkid);

  const rearSkid = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.14, 0.2), skidPlateMat);
  rearSkid.position.set(0, 0.28, -2.18);
  car.add(rearSkid);

  // Main Muscular SUV Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.52, 4.3), bodyMat);
  body.position.set(0, 0.65, 0);
  body.castShadow = true;
  car.add(body);

  // High Upright Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.24, 1.35), bodyMat);
  hood.position.set(0, 0.82, 1.38);
  hood.rotation.x = 0.05;
  hood.castShadow = true;
  car.add(hood);

  // Bold Chrome Front Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.32, 0.08), chromeMat);
  grille.position.set(0, 0.64, 2.16);
  car.add(grille);

  // Grille Mesh Insert
  const grilleInner = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.26, 0.09), claddingMat);
  grilleInner.position.set(0, 0.64, 2.16);
  car.add(grilleInner);

  // High-mounted Headlights
  [-0.70, 0.70].forEach((x) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.12), lightMat);
    light.position.set(x, 0.72, 2.12);
    car.add(light);

    // Lower Fog Lights
    const fog = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), fogMat);
    fog.rotateX(Math.PI / 2);
    fog.position.set(x, 0.38, 2.16);
    car.add(fog);
  });

  // Tall Spacious Greenhouse Cabin
  // Windshield
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.78), glassMat);
  windshield.rotation.x = -Math.PI / 3.4;
  windshield.position.set(0, 1.14, 0.52);
  car.add(windshield);

  // Tall Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.10, 2.05), bodyMat);
  roof.position.set(0, 1.42, -0.42);
  roof.castShadow = true;
  car.add(roof);

  // Dual Satin Silver Roof Rails
  [-0.66, 0.66].forEach((x) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 1.95), skidPlateMat);
    rail.position.set(x, 1.50, -0.42);
    car.add(rail);

    // Rail Supports
    [-0.8, 0, 0.8].forEach((zOff) => {
      const sup = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.08), claddingMat);
      sup.position.set(x, 1.46, -0.42 + zOff);
      car.add(sup);
    });
  });

  // Upright Tailgate Window
  const rearGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.68), glassMat);
  rearGlass.rotation.x = Math.PI / 4.8;
  rearGlass.rotation.y = Math.PI;
  rearGlass.position.set(0, 1.12, -1.48);
  car.add(rearGlass);

  // Rear Roof Spoiler Lip
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.06, 0.28), bodyMat);
  spoiler.position.set(0, 1.44, -1.46);
  car.add(spoiler);

  // Side Windows (Three row windows with pillars)
  [-0.75, 0.75].forEach((x) => {
    const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.44), glassMat);
    sideGlass.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    sideGlass.position.set(x, 1.16, -0.42);
    car.add(sideGlass);

    // Pillars
    [-0.3, 0.35].forEach((zOff) => {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.08), claddingMat);
      pil.position.set(x, 1.16, -0.42 + zOff);
      car.add(pil);
    });

    // SUV Side Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.12), bodyMat);
    mirror.position.set(x > 0 ? x + 0.14 : x - 0.14, 0.94, 0.55);
    car.add(mirror);
  });

  // Rear LED Taillights
  [-0.70, 0.70].forEach((x) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.16, 0.08), tailMat);
    tail.position.set(x, 0.80, -2.16);
    car.add(tail);
  });

  // Dual Rectangular Integrated Exhaust Finishers
  [-0.58, 0.58].forEach((x) => {
    const ex = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.12), chromeMat);
    ex.position.set(x, 0.28, -2.18);
    car.add(ex);
  });

  // 4 Robust SUV Wheels (Taller ground clearance)
  const wheelPositions = [
    [-0.94, 0.36, 1.35],
    [0.94, 0.36, 1.35],
    [-0.94, 0.36, -1.35],
    [0.94, 0.36, -1.35],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const w = createWheel(0.36, 0.28, tireMat, rimMat, hubMat, 6);
    w.position.set(wx, wy, wz);
    car.add(w);
  });

  // Ground Shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 4.6),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.48 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  car.add(shadow);

  return car;
}

// ==========================================
// 4. REALISTIC TRUCK (Semi-Cab + Freight Box)
// ==========================================
function buildTruck(color: number): THREE.Group {
  const truck = new THREE.Group();

  const cabMat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.65,
    roughness: 0.32,
  });
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.2 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8, metalness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.06, metalness: 0.92, transparent: true, opacity: 0.88 });
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.92 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.88, roughness: 0.18 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.5 });

  // Heavy-duty Truck Chassis Rails
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.28, 6.4), frameMat);
  chassis.position.set(0, 0.42, 0);
  truck.add(chassis);

  // ================= TRACTOR CAB =================
  // Main Cab Body
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.45, 1.75), cabMat);
  cab.position.set(0, 1.25, 2.05);
  cab.castShadow = true;
  truck.add(cab);

  // Aerodynamic Cab Roof Fairing / Wind Deflector
  const deflector = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.55, 1.55), cabMat);
  deflector.position.set(0, 2.15, 1.95);
  deflector.rotation.x = -0.22;
  deflector.castShadow = true;
  truck.add(deflector);

  // Cab Roof Clearance / Marker Lights (5 Amber LEDs)
  [-0.6, -0.3, 0, 0.3, 0.6].forEach((x) => {
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.08), amberMat);
    marker.position.set(x, 2.38, 1.62);
    truck.add(marker);
  });

  // Massive Chrome Front Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.72, 0.12), chromeMat);
  grille.position.set(0, 0.96, 2.94);
  truck.add(grille);

  // Grille Horizontal Bars
  for (let i = -3; i <= 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.03, 0.13), frameMat);
    bar.position.set(0, 0.96 + i * 0.09, 2.94);
    truck.add(bar);
  }

  // Heavy Steel Front Bumper
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.35, 0.32), chromeMat);
  bumper.position.set(0, 0.48, 2.92);
  bumper.castShadow = true;
  truck.add(bumper);

  // Headlights (Dual High-power Truck Lights)
  [-0.82, 0.82].forEach((x) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.12), lightMat);
    light.position.set(x, 0.48, 3.08);
    truck.add(light);
  });

  // Large Panoramic Curved Windshield
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 0.74), glassMat);
  windshield.position.set(0, 1.48, 2.93);
  windshield.rotation.x = -0.12;
  truck.add(windshield);

  // Twin Windshield Wipers
  [-0.35, 0.35].forEach((x) => {
    const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.02), frameMat);
    wiper.rotation.z = -0.3;
    wiper.position.set(x, 1.25, 2.96);
    truck.add(wiper);
  });

  // Cab Side Windows & Vertical Truck Mirrors
  [-1.03, 1.03].forEach((x) => {
    const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), glassMat);
    windowMesh.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    windowMesh.position.set(x, 1.45, 2.05);
    truck.add(windowMesh);

    // Large Vertical Dual Truck Mirror
    const mirrorBracket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.04), frameMat);
    mirrorBracket.position.set(x > 0 ? x + 0.14 : x - 0.14, 1.55, 2.55);
    truck.add(mirrorBracket);

    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.18), chromeMat);
    mirrorHead.position.set(x > 0 ? x + 0.26 : x - 0.26, 1.42, 2.55);
    truck.add(mirrorHead);

    // Cab Access Steps
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.65), chromeMat);
    step.position.set(x > 0 ? x + 0.06 : x - 0.06, 0.38, 2.05);
    truck.add(step);
  });

  // Cylindrical Chrome Fuel Tanks (Under Cab Sides)
  [-0.92, 0.92].forEach((x) => {
    const tankGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.25, 16);
    tankGeo.rotateX(Math.PI / 2);
    const tank = new THREE.Mesh(tankGeo, chromeMat);
    tank.position.set(x, 0.44, 0.65);
    truck.add(tank);
  });

  // Vertical Chrome Exhaust Stack behind cab
  const exhaustStack = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.1, 16), chromeMat);
  exhaustStack.position.set(-0.88, 1.65, 1.05);
  truck.add(exhaustStack);

  // ================= CARGO FREIGHT CONTAINER =================
  // Main Enclosed Freight Box
  const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(2.18, 2.15, 4.3), boxMat);
  cargoBox.position.set(0, 1.65, -0.95);
  cargoBox.castShadow = true;
  truck.add(cargoBox);

  // Aluminum Corner Structural Reinforcements
  const cornerGeo = new THREE.BoxGeometry(0.08, 2.18, 0.08);
  [-1.09, 1.09].forEach((x) => {
    [-3.1, 1.2].forEach((z) => {
      const post = new THREE.Mesh(cornerGeo, frameMat);
      post.position.set(x, 1.65, z);
      truck.add(post);
    });
  });

  // Cargo Box Corner Clearance Lights
  [-1.1, 1.1].forEach((x) => {
    // Front Amber
    const fLight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), amberMat);
    fLight.position.set(x, 2.68, 1.18);
    truck.add(fLight);

    // Rear Red
    const rLight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), tailMat);
    rLight.position.set(x, 2.68, -3.11);
    truck.add(rLight);
  });

  // Rear Cargo Double Doors Details
  const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.05, 0.04), frameMat);
  doorSeam.position.set(0, 1.65, -3.11);
  truck.add(doorSeam);

  // Vertical Door Locking Cam Bars
  [-0.38, 0.38].forEach((x) => {
    const camBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 8), chromeMat);
    camBar.position.set(x, 1.65, -3.12);
    truck.add(camBar);
  });

  // Rear Underride Crash Guard (DOT Bumper) with Red/White Reflective Tape
  const dotBumper = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.12, 0.12), chromeMat);
  dotBumper.position.set(0, 0.42, -3.16);
  truck.add(dotBumper);

  // Commercial Stacked Taillights (Red / Amber / White)
  [-0.82, 0.82].forEach((x) => {
    const tailCluster = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.08), tailMat);
    tailCluster.position.set(x, 0.62, -3.12);
    truck.add(tailCluster);

    // Rear Rubber Mudflaps
    const mudflap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.03), frameMat);
    mudflap.position.set(x, 0.35, -2.48);
    truck.add(mudflap);
  });

  // ================= 6 HEAVY DUTY WHEELS =================
  // Front Steer Axle + Tandem Dual Rear Axles
  const wheelPositions = [
    [-1.02, 0.42, 2.35], // Front Left
    [1.02, 0.42, 2.35],  // Front Right
    [-1.04, 0.42, -1.35], // Rear Axle 1 Left
    [1.04, 0.42, -1.35],  // Rear Axle 1 Right
    [-1.04, 0.42, -2.35], // Rear Axle 2 Left
    [1.04, 0.42, -2.35],  // Rear Axle 2 Right
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const w = createWheel(0.42, 0.32, tireMat, rimMat, hubMat, 8, true);
    w.position.set(wx, wy, wz);
    truck.add(w);
  });

  // Ground Shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 6.7),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.52 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  truck.add(shadow);

  return truck;
}

// ==========================================
// 5. REALISTIC VAN (Modern High-Roof Van)
// ==========================================
function buildVan(color: number): THREE.Group {
  const van = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.6,
    roughness: 0.35,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.06, metalness: 0.9, transparent: true, opacity: 0.88 });
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4 });

  // Chassis Underbody
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.14, 4.45), trimMat);
  chassis.position.set(0, 0.26, 0);
  van.add(chassis);

  // Sturdy Plastic Lower Perimeter Trim (Front & Rear Bumpers)
  const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.35, 0.45), trimMat);
  bumperFront.position.set(0, 0.42, 2.12);
  van.add(bumperFront);

  const bumperRear = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.32, 0.35), trimMat);
  bumperRear.position.set(0, 0.42, -2.18);
  van.add(bumperRear);

  // Main Van Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.88, 1.25, 4.35), bodyMat);
  body.position.set(0, 1.05, 0);
  body.castShadow = true;
  van.add(body);

  // Aerodynamic Short Slanted Nose
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.38, 0.85), bodyMat);
  nose.position.set(0, 0.74, 1.85);
  nose.rotation.x = 0.22;
  nose.castShadow = true;
  van.add(nose);

  // Front Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 0.08), trimMat);
  grille.position.set(0, 0.58, 2.26);
  van.add(grille);

  // Modern Headlights
  [-0.72, 0.72].forEach((x) => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.12), lightMat);
    light.position.set(x, 0.68, 2.24);
    van.add(light);
  });

  // Tall Expansive Windshield
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.60, 0.76), glassMat);
  windshield.rotation.x = -Math.PI / 3.6;
  windshield.position.set(0, 1.26, 1.34);
  van.add(windshield);

  // High Roof with Reinforcing Ribs
  for (let r = -0.55; r <= 0.55; r += 0.28) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 3.2), bodyMat);
    rib.position.set(r, 1.70, -0.45);
    van.add(rib);
  }

  // Front Side Cabin Windows & Large Van Mirrors
  [-0.95, 0.95].forEach((x) => {
    const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.48), glassMat);
    sideGlass.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    sideGlass.position.set(x, 1.28, 0.85);
    van.add(sideGlass);

    // Large Van Side Mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.14), trimMat);
    mirror.position.set(x > 0 ? x + 0.14 : x - 0.14, 1.05, 1.25);
    van.add(mirror);
  });

  // Right Side Sliding Cargo Door Track
  const doorRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 2.1), trimMat);
  doorRail.position.set(0.95, 0.85, -0.45);
  van.add(doorRail);

  // Rear 50/50 Barn Doors with Windows
  [-0.42, 0.42].forEach((x) => {
    const rearWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.45), glassMat);
    rearWindow.rotation.y = Math.PI;
    rearWindow.position.set(x, 1.35, -2.19);
    van.add(rearWindow);
  });

  // Rear Door Center Seam
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.28, 0.04), trimMat);
  seam.position.set(0, 1.08, -2.19);
  van.add(seam);

  // Tall Vertical Pillar Taillights (Running up rear corners)
  [-0.88, 0.88].forEach((x) => {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.08), tailMat);
    tail.position.set(x, 1.05, -2.18);
    van.add(tail);
  });

  // 4 Commercial-Grade Van Wheels
  const wheelPositions = [
    [-0.92, 0.35, 1.35],
    [0.92, 0.35, 1.35],
    [-0.92, 0.35, -1.35],
    [0.92, 0.35, -1.35],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const w = createWheel(0.35, 0.26, tireMat, rimMat, hubMat, 5);
    w.position.set(wx, wy, wz);
    van.add(w);
  });

  // Ground Shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.15, 4.6),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.48 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  van.add(shadow);

  return van;
}

/**
 * Public factory function to build authentic, realistic traffic vehicles
 */
export function buildRealisticTrafficVehicle(type: string, color: number): THREE.Group {
  switch (type.toLowerCase()) {
    case 'sedan':
      return buildSedan(color);
    case 'sports':
      return buildSportsCoupe(color);
    case 'suv':
      return buildSUV(color);
    case 'truck':
      return buildTruck(color);
    case 'van':
      return buildVan(color);
    default:
      return buildSedan(color);
  }
}
