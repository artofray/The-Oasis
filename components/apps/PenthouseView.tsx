import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import type { RoundTableAgent, PenthouseLayout, PenthouseFurniture } from '../../types';
import { createHumanoidAgent } from './sandbox/helpers';

interface PenthouseViewProps {
    agents: RoundTableAgent[];
    layout: PenthouseLayout;
    setLayout: (layout: PenthouseLayout) => void;
}

type FurnitureType = 'sofa' | 'table' | 'chair' | 'plant';

const furnitureLibrary: { type: FurnitureType; name: string; icon: string }[] = [
    { type: 'sofa', name: 'Sofa', icon: '🛋️' },
    { type: 'table', name: 'Table', icon: '🪵' },
    { type: 'chair', name: 'Chair', icon: '🪑' },
    { type: 'plant', name: 'Plant', icon: '🪴' },
];

export const PenthouseView: React.FC<PenthouseViewProps> = ({ agents, layout, setLayout }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isInVR, setIsInVR] = useState(false);
    const [placingFurniture, setPlacingFurniture] = useState<FurnitureType | null>(null);
    const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
    const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
    const furnitureMeshes = useRef<Map<string, THREE.Object3D>>(new Map());

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;
        const scene = sceneRef.current;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true; // Enable WebXR
        currentMount.appendChild(renderer.domElement);

        // VR Button
        const vrButton = VRButton.createButton(renderer);
        vrButton.style.position = 'absolute';
        vrButton.style.bottom = '20px';
        vrButton.style.right = '20px';
        vrButton.style.zIndex = '100';
        currentMount.appendChild(vrButton);

        const onSessionStart = () => setIsInVR(true);
        const onSessionEnd = () => setIsInVR(false);
        renderer.xr.addEventListener('sessionstart', onSessionStart);
        renderer.xr.addEventListener('sessionend', onSessionEnd);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(10, 5, 15);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.target.set(0, 2, 0);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(20, 30, 20);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        scene.add(light);

        // Scene objects
        scene.background = new THREE.Color(0x1a202c);
        
        const floorGeo = new THREE.BoxGeometry(30, 0.2, 20);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.receiveShadow = true;
        scene.add(floor);
        
        // Pool
        const poolWaterGeo = new THREE.PlaneGeometry(8, 18);
        const poolWaterMat = new THREE.MeshStandardMaterial({ color: 0x00BFFF, transparent: true, opacity: 0.7 });
        const poolWater = new THREE.Mesh(poolWaterGeo, poolWaterMat);
        poolWater.rotation.x = -Math.PI / 2;
        poolWater.position.set(10, 0.11, 0);
        scene.add(poolWater);

        // Jacuzzi
        const jacuzziWaterGeo = new THREE.CylinderGeometry(2, 2, 0.2, 32);
        const jacuzziWater = new THREE.Mesh(jacuzziWaterGeo, poolWaterMat);
        jacuzziWater.position.set(-12, 0.11, 7);
        scene.add(jacuzziWater);
        
        // Add Maggie
        const maggie = agents.find(a => a.id === 'maggie');
        if (maggie) {
            const maggieModel = createHumanoidAgent(maggie);
            maggieModel.position.set(0, 0.1, 5);
            scene.add(maggieModel);
            scene.userData.maggieModel = maggieModel;
        }

        // Raycasting for furniture placement
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let placementIndicator: THREE.Object3D | null = null;
        
        const updatePlacement = (event: MouseEvent) => {
            if (!placingFurniture) return;
            const rect = currentMount.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(floor);
            if (intersects.length > 0) {
                if (!placementIndicator) {
                    placementIndicator = createFurnitureMesh({ id: 'indicator', type: placingFurniture, position: {x:0,y:0,z:0}, rotation: 0 });
                    placementIndicator.traverse(child => {
                        if (child instanceof THREE.Mesh) {
                           const newMaterial = (child.material as THREE.Material).clone();
                           newMaterial.transparent = true;
                           newMaterial.opacity = 0.5;
                           child.material = newMaterial;
                        }
                    });
                    scene.add(placementIndicator);
                }
                placementIndicator.position.copy(intersects[0].point);
                placementIndicator.position.y += 0.1; 
            }
        };
        
        const placeItem = () => {
            if (!placingFurniture || !placementIndicator) return;
            const newFurniture: PenthouseFurniture = {
                id: `furn-${Date.now()}`,
                type: placingFurniture,
                position: { x: placementIndicator.position.x, y: 0.1, z: placementIndicator.position.z },
                rotation: 0,
            };
            setLayout([...layout, newFurniture]);
            setPlacingFurniture(null);
            scene.remove(placementIndicator);
            placementIndicator = null;
        };

        const selectItem = (event: MouseEvent) => {
            if (isEditMode) {
                const rect = currentMount.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(Array.from(furnitureMeshes.current.values()));

                if (intersects.length > 0) {
                    let intersectedObject = intersects[0].object;
                    while(intersectedObject.parent && !Array.from(furnitureMeshes.current.values()).includes(intersectedObject)) {
                        intersectedObject = intersectedObject.parent;
                    }

                    const intersectedId = Array.from(furnitureMeshes.current.entries()).find(
                        ([, mesh]) => mesh === intersectedObject
                    )?.[0];
                    setSelectedFurniture(intersectedId || null);
                } else {
                    setSelectedFurniture(null);
                }
            }
        };


        const handleClick = (event: MouseEvent) => {
            if (placingFurniture) placeItem();
            else selectItem(event);
        }

        currentMount.addEventListener('mousemove', updatePlacement);
        currentMount.addEventListener('click', handleClick);

        // Animation loop
        const animate = () => {
            controls.update();
            if (scene.userData.maggieModel && scene.userData.maggieModel.userData.animate) {
                scene.userData.maggieModel.userData.animate();
            }
            renderer.render(scene, camera);
        };
        renderer.setAnimationLoop(animate);

        // Cleanup
        return () => {
            renderer.setAnimationLoop(null);
            renderer.xr.removeEventListener('sessionstart', onSessionStart);
            renderer.xr.removeEventListener('sessionend', onSessionEnd);
            currentMount.removeEventListener('mousemove', updatePlacement);
            currentMount.removeEventListener('click', handleClick);
            if (vrButton.parentElement) vrButton.parentElement.removeChild(vrButton);
            if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        const currentIds = new Set(layout.map(f => f.id));
        furnitureMeshes.current.forEach((mesh, id) => {
            if (!currentIds.has(id)) {
                scene.remove(mesh);
                furnitureMeshes.current.delete(id);
            }
        });
        layout.forEach(furn => {
            let mesh = furnitureMeshes.current.get(furn.id);
            if (!mesh) {
                mesh = createFurnitureMesh(furn);
                scene.add(mesh);
                furnitureMeshes.current.set(furn.id, mesh);
            }
            mesh.position.set(furn.position.x, furn.position.y, furn.position.z);
            mesh.rotation.y = furn.rotation;
        });

        furnitureMeshes.current.forEach((mesh, id) => {
            const isSelected = id === selectedFurniture;
            mesh.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    (child.material as THREE.MeshStandardMaterial).emissive.setHex(isSelected ? 0xff0000 : 0x000000);
                }
            })
        });

    }, [layout, selectedFurniture]);

    const createFurnitureMesh = (furn: PenthouseFurniture): THREE.Object3D => {
        const group = new THREE.Object3D();
        let geometry: THREE.BufferGeometry;
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

        switch (furn.type) {
            case 'sofa':
                geometry = new THREE.BoxGeometry(4, 1, 1.5);
                break;
            case 'table':
                geometry = new THREE.CylinderGeometry(1, 1, 0.8, 32);
                break;
            case 'chair':
                geometry = new THREE.BoxGeometry(1, 1.8, 1);
                break;
            case 'plant':
                geometry = new THREE.ConeGeometry(0.5, 1.5, 32);
                (material as THREE.MeshStandardMaterial).color.set(0x00ff00);
                break;
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        group.add(mesh);
        return group;
    };
    
    const handleRotate = () => {
        if (!selectedFurniture) return;
        const newLayout = layout.map(f => {
            if (f.id === selectedFurniture) {
                return { ...f, rotation: f.rotation + Math.PI / 4 };
            }
            return f;
        });
        setLayout(newLayout);
    };

    const handleDelete = () => {
        if (!selectedFurniture) return;
        const newLayout = layout.filter(f => f.id !== selectedFurniture);
        setLayout(newLayout);
        setSelectedFurniture(null);
    };

    return (
        <div className="h-full w-full relative">
            <div ref={mountRef} className="w-full h-full" />
            {!isInVR && (
                <>
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <button
                            onClick={() => {
                                setIsEditMode(!isEditMode);
                                setPlacingFurniture(null);
                                setSelectedFurniture(null);
                            }}
                            className={`px-4 py-2 rounded-lg font-bold text-white transition-colors ${isEditMode ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                        >
                            {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                        </button>
                    </div>
                    {isEditMode && (
                        <div className="absolute top-16 left-4 bg-gray-900/80 p-4 rounded-lg backdrop-blur-sm animate-fadeIn flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-white">Furniture</h3>
                            {furnitureLibrary.map(item => (
                                <button
                                    key={item.type}
                                    onClick={() => {
                                        setPlacingFurniture(item.type);
                                        setSelectedFurniture(null);
                                    }}
                                    className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors ${placingFurniture === item.type ? 'bg-cyan-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    <span className="text-2xl">{item.icon}</span>
                                    <span>{item.name}</span>
                                </button>
                            ))}
                            {selectedFurniture && (
                                <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
                                    <h4 className="font-bold text-white">Selected Item</h4>
                                    <button onClick={handleRotate} className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded-md">Rotate</button>
                                    <button onClick={handleDelete} className="w-full p-2 bg-red-600 hover:bg-red-700 rounded-md">Delete</button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
