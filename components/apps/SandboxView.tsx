import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { RoundTableAgent } from '../../types';
import { AgentEditor3D } from './sandbox/AgentEditor3D';
import { createHumanoidAgent } from './sandbox/helpers';

interface SandboxViewProps {
    agents: RoundTableAgent[];
    setAgents: (agents: RoundTableAgent[]) => void;
}

const environments = {
    'Default': { bg: 0x1a202c, fog: 0x1a202c, ground: 0x2d3748 },
    'Twilight': { bg: 0x4a2f58, fog: 0x4a2f58, ground: 0x2e1d38 },
    'Abyss': { bg: 0x000000, fog: 0x000000, ground: 0x111111 }
};
type EnvironmentName = keyof typeof environments;

export const SandboxView: React.FC<SandboxViewProps> = ({ agents, setAgents }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const agentGroupsRef = useRef<{ group: THREE.Group, velocity: THREE.Vector3 }[]>([]);
  const selectedAgentGroupRef = useRef<THREE.Group | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentAgents, setCurrentAgents] = useState<RoundTableAgent[]>(agents);
  const [selectedAgent, setSelectedAgent] = useState<RoundTableAgent | null>(null);
  const [editingAgent, setEditingAgent] = useState<RoundTableAgent | null>(null);
  const [isPuppeteerMode, setIsPuppeteerMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentName>('Default');

  useEffect(() => {
    setCurrentAgents(agents);
  }, [agents]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    const ground = scene.getObjectByName('ground');

    const theme = environments[environment];
    if (theme) {
        scene.background = new THREE.Color(theme.bg);
        if(scene.fog) scene.fog.color.setHex(theme.fog);
        if (ground && ground instanceof THREE.Mesh) {
            (ground.material as THREE.MeshStandardMaterial).color.setHex(theme.ground);
        }
    }
  }, [environment]);


  const startPuppeteer = useCallback(async () => {
    if (!selectedAgent) return;
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }
        setIsPuppeteerMode(true);
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure permissions are granted.");
    }
  }, [selectedAgent]);

  const stopPuppeteer = useCallback(() => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsPuppeteerMode(false);
  }, [stream]);

  const handleSaveAgent = (updatedAgent: RoundTableAgent) => {
    const newAgents = currentAgents.map(a => a.id === updatedAgent.id ? updatedAgent : a);
    setAgents(newAgents); // Update global state

    const scene = sceneRef.current;
    if (!scene) return;

    const oldGroup = scene.children.find(child => child.userData.agent?.id === updatedAgent.id) as THREE.Group;

    if (oldGroup) {
      const newGroup = createHumanoidAgent(updatedAgent);
      newGroup.position.copy(oldGroup.position);
      newGroup.quaternion.copy(oldGroup.quaternion);
      newGroup.userData = { agent: updatedAgent, target: oldGroup.userData.target };
      
      scene.remove(oldGroup);
      oldGroup.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      scene.add(newGroup);

      const agentIndex = agentGroupsRef.current.findIndex(ag => ag.group === oldGroup);
      if (agentIndex !== -1) {
        agentGroupsRef.current[agentIndex].group = newGroup;
      }

      if (selectedAgentGroupRef.current === oldGroup) {
        selectedAgentGroupRef.current = newGroup;
        newGroup.traverse(child => {
          if (child instanceof THREE.Mesh) {
            (child.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ffff);
          }
        });
      }
    }
    setEditingAgent(null);
  };
  
  const handleInteract = () => {
        const maggieGroup = agentGroupsRef.current.find(ag => ag.group.userData.agent?.id === 'maggie')?.group;
        if (maggieGroup) {
            // A simple "wave" animation
            // FIX: Add type guard to ensure child is a Mesh before accessing geometry.
            const rightArm = maggieGroup.children.find(c => c instanceof THREE.Mesh && c.position.x > 0 && c.geometry instanceof THREE.CylinderGeometry);
            if (rightArm) {
                const initialRotation = rightArm.rotation.z;
                let t = 0;
                const wave = () => {
                    t += 0.1;
                    rightArm.rotation.z = initialRotation - Math.sin(t * Math.PI * 2) * 0.5;
                    if (t < 2) {
                        requestAnimationFrame(wave);
                    } else {
                        rightArm.rotation.z = initialRotation;
                    }
                };
                wave();
            }
        }
    };


  useEffect(() => {
    if (!mountRef.current) return;
    
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const initialTheme = environments[environment];
    scene.background = new THREE.Color(initialTheme.bg);
    scene.fog = new THREE.Fog(initialTheme.fog, 50, 150);

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2.1;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 50, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: initialTheme.ground });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.name = 'ground';
    scene.add(plane);

    agentGroupsRef.current = [];
    const bounds = 45;

    agents.forEach((agent) => {
        const group = createHumanoidAgent(agent);
        group.position.set(
            (Math.random() - 0.5) * bounds * 1.5,
            0,
            (Math.random() - 0.5) * bounds * 1.5
        );
        group.userData = { agent, target: null };
        scene.add(group);
        agentGroupsRef.current.push({
            group: group,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, 0, (Math.random() - 0.5) * 0.05)
        });
    });
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const deselectAgent = () => {
        if (selectedAgentGroupRef.current) {
            selectedAgentGroupRef.current.traverse(child => {
                 if (child instanceof THREE.Mesh) {
                    (child.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                 }
            });
        }
        selectedAgentGroupRef.current = null;
        setSelectedAgent(null);
        if (isPuppeteerMode) stopPuppeteer();
    }

    const onMouseClick = (event: MouseEvent) => {
        if (!currentMount) return;
        const rect = currentMount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        const agentIntersect = intersects.find(intersect => {
            let obj = intersect.object;
            while (obj.parent && !obj.userData.agent) {
                obj = obj.parent;
            }
            return !!obj.userData.agent;
        });

        if (agentIntersect) {
            let object = agentIntersect.object;
            while(object.parent && !object.userData.agent) {
                object = object.parent;
            }
            if (object instanceof THREE.Group) {
                deselectAgent();
                selectedAgentGroupRef.current = object;
                selectedAgentGroupRef.current.traverse(child => {
                     if (child instanceof THREE.Mesh) {
                        (child.material as THREE.MeshStandardMaterial).emissive.setHex(0x00ffff);
                     }
                });
                setSelectedAgent(selectedAgentGroupRef.current.userData.agent);
            }
        } else {
           deselectAgent();
        }
    };
    
    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        if (!selectedAgentGroupRef.current || isPuppeteerMode || !currentMount) return;
        
        const rect = currentMount.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);

        if (intersects.length > 0) {
            const targetPoint = intersects[0].point;
            selectedAgentGroupRef.current.userData.target = targetPoint;
        }
    }
    
    currentMount.addEventListener('click', onMouseClick);
    currentMount.addEventListener('contextmenu', onContextMenu);

    const clock = new THREE.Clock();
    const dummyObject = new THREE.Object3D();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const selectedGroup = selectedAgentGroupRef.current;

      agentGroupsRef.current.forEach(agent => {
        if (agent.group.userData.animate) {
            agent.group.userData.animate();
        }
      });


      if (isPuppeteerMode && selectedGroup) {
          const head = selectedGroup.getObjectByName('head');
          if (head) {
              head.rotation.y = Math.sin(elapsedTime * 0.8) * 0.4;
              head.rotation.x = Math.sin(elapsedTime * 0.6) * 0.2;
          }
           agentGroupsRef.current.forEach(agent => {
               if(agent.group !== selectedGroup) {
                    agent.group.position.y = 0;
               }
           });
           selectedGroup.position.y = Math.sin(elapsedTime * 2) * 0.1;

      } else {
        agentGroupsRef.current.forEach(agent => {
            const { group } = agent;
            const { target } = group.userData;
            let { velocity } = agent;

            let isMoving = false;
            let moveDirection = new THREE.Vector3();

            if (target) {
                const distance = group.position.distanceTo(target);
                if (distance > 1) {
                    moveDirection.subVectors(target, group.position).normalize();
                    group.position.add(moveDirection.clone().multiplyScalar(0.1));
                    isMoving = true;
                } else {
                    group.userData.target = null;
                }
            } else {
                group.position.add(velocity);
                if (group.position.x < -bounds || group.position.x > bounds) velocity.x *= -1;
                if (group.position.z < -bounds || group.position.z > bounds) velocity.z *= -1;
                moveDirection.copy(velocity).normalize();
                isMoving = true;
            }

            if (isMoving && group.userData.agent?.id !== 'maggie') {
                dummyObject.position.copy(group.position);
                dummyObject.lookAt(group.position.clone().add(moveDirection));
                group.quaternion.slerp(dummyObject.quaternion, 0.1);
                group.position.y = Math.sin(elapsedTime * 8 + group.id) * 0.2;
            } else if (!isMoving) {
                group.position.y = 0;
            }
        });
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if(!currentMount) return;
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', onMouseClick);
      currentMount.removeEventListener('contextmenu', onContextMenu);
      if(renderer.domElement.parentElement === currentMount){
        currentMount.removeChild(renderer.domElement);
      }
      stopPuppeteer();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                (object.material as THREE.Material).dispose();
            }
          }
        }
      });
    };
  }, [agents, stopPuppeteer]);

  return (
    <div className="flex flex-col h-full w-full">
        <div className="flex justify-between items-start mb-4 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-cyan-300">3D Sandbox</h2>
                <p className="text-gray-400">An interactive environment for agents. Select an agent to puppeteer or command.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0 items-center">
                 <div className="relative">
                    <select
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value as EnvironmentName)}
                        className="appearance-none px-4 py-2 rounded-lg font-bold text-white transition-colors bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        {Object.keys(environments).map(env => (
                            <option key={env} value={env}>{env}</option>
                        ))}
                    </select>
                </div>
                 {selectedAgent?.id === 'maggie' && (
                    <button 
                        onClick={handleInteract}
                        className="px-4 py-2 rounded-lg font-bold text-white transition-colors bg-amber-600 hover:bg-amber-700"
                    >
                        Interact
                    </button>
                 )}
                 <button 
                    onClick={() => editingAgent ? setEditingAgent(null) : setEditingAgent(selectedAgent)}
                    disabled={!selectedAgent}
                    className="px-4 py-2 rounded-lg font-bold text-white transition-colors bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Edit Avatar
                </button>
                 <button 
                    onClick={() => isPuppeteerMode ? stopPuppeteer() : startPuppeteer()}
                    disabled={!selectedAgent}
                    className={`px-4 py-2 rounded-lg font-bold text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${isPuppeteerMode ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                >
                    {isPuppeteerMode ? 'Disable Puppeteer' : 'Enable Puppeteer'}
                </button>
            </div>
        </div>
        <div className="flex-1 w-full rounded-lg overflow-hidden relative">
            <div ref={mountRef} className="w-full h-full" />
            
            {isPuppeteerMode && (
                <div className="absolute top-4 left-4 w-48 h-36 bg-black border-2 border-cyan-400 rounded-lg shadow-lg animate-fadeIn">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-md" />
                    <div className="absolute top-1 right-1 flex items-center gap-1 bg-red-600/80 px-2 py-0.5 rounded-full text-white text-xs font-bold">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                     <p className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-0.5 rounded-full text-white text-xs font-semibold">
                        TRACKING LIVE
                    </p>
                </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/50 p-3 rounded-lg backdrop-blur-sm text-center animate-fadeInUp">
                <p className="text-sm font-semibold text-white">
                    {selectedAgent ? 
                        `Selected: ${selectedAgent.name}` : 
                        'Click an agent to select'
                    }
                </p>
                 <p className="text-xs text-gray-300">
                    {selectedAgent ? 
                        (isPuppeteerMode ? 'Puppeteering is active.' : 'Right-click on ground to issue a move command.') :
                        'Right-click to move a selected agent.'
                    }
                </p>
            </div>
        </div>
        {editingAgent && (
            <AgentEditor3D
                agent={editingAgent}
                onClose={() => setEditingAgent(null)}
                onSave={handleSaveAgent}
            />
        )}
    </div>
  );
};