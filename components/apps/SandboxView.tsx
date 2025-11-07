import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AgentEditor3D } from './sandbox/AgentEditor3D';
import { ConversationLog } from './sandbox/ConversationLog';
import { GlassCard } from '../ui/GlassCard';
import { createHumanoidAgent } from './sandbox/helpers';
import type { RoundTableAgent, SandboxEnvironment, Conversation } from '../../types';

interface SandboxViewProps {
    agents: RoundTableAgent[];
    setAgents: (updater: (prev: RoundTableAgent[]) => RoundTableAgent[]) => void;
    environment: SandboxEnvironment;
    setEnvironment: (env: SandboxEnvironment) => void;
}

export const SandboxView: React.FC<SandboxViewProps> = ({ agents, setAgents, environment }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const agentMeshes = useRef<Map<string, THREE.Group>>(new Map());
    const [selectedAgent, setSelectedAgent] = useState<RoundTableAgent | null>(null);
    const [conversations, setConversations] = useState<Record<string, Conversation>>({});

    // Main Three.js setup effect
    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 10, 20);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.shadowMap.enabled = true;
        currentMount.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 2, 0);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 20, 5);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Floor
        const floorGeo = new THREE.PlaneGeometry(50, 50);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onDoubleClick = (event: MouseEvent) => {
            const rect = currentMount.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(Array.from(agentMeshes.current.values()), true);
            if (intersects.length > 0) {
                 let intersectedObject = intersects[0].object;
                 while(intersectedObject.parent && !Array.from(agentMeshes.current.values()).includes(intersectedObject as THREE.Group)) {
                    intersectedObject = intersectedObject.parent;
                 }
                const agentId = Array.from(agentMeshes.current.entries()).find(([, mesh]) => mesh === intersectedObject)?.[0];
                if (agentId) {
                    const agentToEdit = agents.find(a => a.id === agentId);
                    if (agentToEdit) setSelectedAgent(agentToEdit);
                }
            }
        };
        currentMount.addEventListener('dblclick', onDoubleClick);

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            const delta = clock.getDelta();

            agentMeshes.current.forEach((agentModel, agentId) => {
                if(agentModel.userData.animate) {
                    agentModel.userData.animate();
                }

                // Simulate random movement
                if (!agentModel.userData.targetPosition) {
                     agentModel.userData.targetPosition = new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
                }
                const direction = new THREE.Vector3().subVectors(agentModel.userData.targetPosition, agentModel.position);
                if (direction.length() > 0.5) {
                    direction.normalize();
                    agentModel.position.add(direction.multiplyScalar(delta * 2));
                    // Look at direction
                    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), direction);
                    agentModel.quaternion.slerp(targetQuaternion, 0.1);
                } else {
                     agentModel.userData.targetPosition = new THREE.Vector3((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
                }
            });

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            currentMount.removeChild(renderer.domElement);
            currentMount.removeEventListener('dblclick', onDoubleClick);
        };
    }, []);

    // Effect to update scene when agents change
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        // Remove old agents
        agentMeshes.current.forEach((mesh, id) => {
            if (!agents.find(a => a.id === id)) {
                scene.remove(mesh);
                agentMeshes.current.delete(id);
            }
        });
        // Add or update agents
        agents.forEach(agent => {
            let mesh = agentMeshes.current.get(agent.id);
            if (mesh) {
                // If agent data (like color) changes, we need to rebuild it.
                // Simple approach: remove and re-add.
                scene.remove(mesh);
            }
            mesh = createHumanoidAgent(agent);
            mesh.position.set((Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 40);
            scene.add(mesh);
            agentMeshes.current.set(agent.id, mesh);
        });
    }, [agents]);
    
    // Effect for environment changes
    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        switch (environment) {
            case 'Sci-Fi':
                scene.background = new THREE.Color(0x111122);
                break;
            case 'Fantasy':
                scene.background = new THREE.Color(0x448844);
                break;
            case 'Urban':
                 scene.background = new THREE.Color(0x555555);
                 break;
            case 'Default':
            default:
                 scene.background = new THREE.Color(0xaaaaaa);
                 break;
        }
    }, [environment]);

    const handleSaveAgent = (updatedAgent: RoundTableAgent) => {
        setAgents(prev => prev.map(a => (a.id === updatedAgent.id ? updatedAgent : a)));
        setSelectedAgent(null);
    };

    return (
        <div className="h-full w-full relative">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute top-4 left-4">
                <GlassCard className="p-2">
                     <p className="text-white text-sm">Environment: <strong>{environment}</strong></p>
                </GlassCard>
            </div>
            <ConversationLog conversations={conversations} agents={agents} />
            {selectedAgent && (
                <AgentEditor3D 
                    agent={selectedAgent}
                    onSave={handleSaveAgent}
                    onClose={() => setSelectedAgent(null)}
                />
            )}
        </div>
    );
};
