import * as THREE from 'three';
import type { RoundTableAgent } from '../../../types';

export const createMaggieModel = (): THREE.Group => {
    const group = new THREE.Group();

    // Materials
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.6 });
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
    const shortsMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xDC143C, roughness: 0.5 });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 });
    
    // Body
    const torsoGeo = new THREE.BoxGeometry(1, 1.4, 0.5);
    const torso = new THREE.Mesh(torsoGeo, skinMaterial);
    torso.position.y = 1.3;
    
    const chestGeo = new THREE.SphereGeometry(0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const leftChest = new THREE.Mesh(chestGeo, skinMaterial);
    leftChest.position.set(-0.3, 1.7, 0.25);
    const rightChest = leftChest.clone();
    rightChest.position.x = 0.3;
    torso.add(leftChest, rightChest);
    
    // Top
    const topGeo = new THREE.BoxGeometry(1.05, 0.6, 0.55);
    const top = new THREE.Mesh(topGeo, topMaterial);
    top.position.y = 1.7;
    
    const chestCoverageGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 32);
    const chestCoverage = new THREE.Mesh(chestCoverageGeo, topMaterial);
    chestCoverage.position.y = 1.8;
    chestCoverage.rotation.x = Math.PI / 2;
    
    // Legs
    const legGeo = new THREE.CylinderGeometry(0.2, 0.15, 1.8, 16);
    const leftLeg = new THREE.Mesh(legGeo, skinMaterial);
    leftLeg.position.set(-0.3, 0.9, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.3;

    // Shorts
    const shortsGeo = new THREE.BoxGeometry(1, 0.5, 0.5);
    const shorts = new THREE.Mesh(shortsGeo, shortsMaterial);
    shorts.position.y = 1.0;
    
    // Arms
    const armGeo = new THREE.CylinderGeometry(0.15, 0.1, 1.5, 16);
    const leftArm = new THREE.Mesh(armGeo, skinMaterial);
    leftArm.position.set(-0.8, 1.3, 0);
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.8;

    // Head
    const headGeo = new THREE.SphereGeometry(0.4, 32, 16);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 2.4;
    head.name = 'head';

    // Eyes
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 8), eyeMaterial);
    leftEye.position.set(-0.15, 2.45, 0.35);
    const rightEye = leftEye.clone();
    rightEye.position.x = 0.15;
    
    const leftEyelid = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 16, 1, true, 0, Math.PI), skinMaterial);
    leftEyelid.rotation.z = Math.PI/2;
    leftEyelid.rotation.y = Math.PI/2;
    leftEyelid.position.set(-0.15, 2.45, 0.35);
    leftEyelid.scale.y = 0; // Start closed
    leftEyelid.name = "leftLid";
    const rightEyelid = leftEyelid.clone();
    rightEyelid.position.x = 0.15;
    rightEyelid.name = "rightLid";

    // Hair
    const hair = new THREE.Group();
    const mainHairGeo = new THREE.SphereGeometry(0.45, 32, 16);
    const mainHair = new THREE.Mesh(mainHairGeo, hairMaterial);
    mainHair.scale.y = 1.2;
    mainHair.position.y = 2.45;
    hair.add(mainHair);

    group.add(torso, top, chestCoverage, shorts, leftLeg, rightLeg, leftArm, rightArm, head, leftEye, rightEye, leftEyelid, rightEyelid, hair);
    
    // Add blinking animation
    const clock = new THREE.Clock();
    let timeToNextBlink = Math.random() * 3 + 2; // Blink every 2-5 seconds
    let isBlinking = false;

    group.userData.animate = () => {
        const delta = clock.getDelta();
        timeToNextBlink -= delta;

        if (timeToNextBlink <= 0 && !isBlinking) {
            isBlinking = true;
            timeToNextBlink = Math.random() * 3 + 2; // Reset timer
        }

        if (isBlinking) {
            leftEyelid.scale.y += delta * 20; // Blink speed
            rightEyelid.scale.y += delta * 20;
            if (leftEyelid.scale.y >= 1) {
                leftEyelid.scale.y = 1;
                rightEyelid.scale.y = 1;
                isBlinking = false; // End of closing phase
            }
        } else if (leftEyelid.scale.y > 0) {
            leftEyelid.scale.y -= delta * 10; // Open speed
            rightEyelid.scale.y -= delta * 10;
             if (leftEyelid.scale.y < 0) {
                leftEyelid.scale.y = 0;
                rightEyelid.scale.y = 0;
            }
        }
    };
    
    group.traverse(child => { if (child instanceof THREE.Mesh) child.castShadow = true; });
    return group;
};


export const createHumanoidAgent = (agent: RoundTableAgent): THREE.Group => {
    if (agent.id === 'maggie') {
        return createMaggieModel();
    }

    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: agent.colorHex });
    
    const body = agent.body || {};
    const torsoScale = body.torsoScale || 1;
    const armScale = body.armScale || 1;
    const legScale = body.legScale || 1;
    
    const legLength = 1.6 * legScale;
    const torsoHeight = 1.5 * torsoScale;
    const armLength = 1.4 * armScale;

    // Legs
    const legGeo = new THREE.BoxGeometry(0.4, legLength, 0.4);
    const leftLeg = new THREE.Mesh(legGeo, material);
    leftLeg.position.set(-0.3, legLength / 2, 0);
    const rightLeg = new THREE.Mesh(legGeo, material);
    rightLeg.position.set(0.3, legLength / 2, 0);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.2, torsoHeight, 0.6);
    const torso = new THREE.Mesh(torsoGeo, material);
    torso.position.y = legLength + torsoHeight / 2;

    // Head
    const headGeo = new THREE.SphereGeometry(0.5, 32, 16);
    const head = new THREE.Mesh(headGeo, material);
    head.position.y = legLength + torsoHeight + 0.5;
    head.name = 'head';

    // Arms
    const armGeo = new THREE.BoxGeometry(0.3, armLength, 0.3);
    const leftArm = new THREE.Mesh(armGeo, material);
    leftArm.position.set(-0.85, legLength + torsoHeight - armLength / 2, 0);
    const rightArm = new THREE.Mesh(armGeo, material);
    rightArm.position.set(0.85, legLength + torsoHeight - armLength / 2, 0);

    group.add(torso, head, leftLeg, rightLeg, leftArm, rightArm);
    group.traverse(child => { if (child instanceof THREE.Mesh) child.castShadow = true; });
    
    return group;
};
