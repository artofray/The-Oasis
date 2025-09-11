import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { RoundTableAgent } from '../../../types';
import { createHumanoidAgent } from './helpers';

interface AgentEditor3DProps {
    agent: RoundTableAgent;
    onSave: (agent: RoundTableAgent) => void;
    onClose: () => void;
}

const XIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const AgentEditor3D: React.FC<AgentEditor3DProps> = ({ agent, onSave, onClose }) => {
    const [formData, setFormData] = useState<RoundTableAgent>(agent);
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const agentModelRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        setFormData(agent);
    }, [agent]);
    
    useEffect(() => {
      const scene = sceneRef.current;
      if (scene) {
        if (agentModelRef.current) {
          scene.remove(agentModelRef.current);
          // Simple disposal for preview
          agentModelRef.current.traverse(obj => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose();
              obj.material.dispose();
            }
          })
        }
        const newModel = createHumanoidAgent(formData);
        scene.add(newModel);
        agentModelRef.current = newModel;
      }
    }, [formData]);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x2d3748);

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(0, 2.5, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 2, 0);

        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const agentModel = createHumanoidAgent(formData);
        agentModelRef.current = agentModel;
        scene.add(agentModel);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (renderer.domElement.parentElement === currentMount) {
              currentMount.removeChild(renderer.domElement);
            }
        };
    }, []);

    const handleBodyChange = (prop: 'torsoScale' | 'armScale' | 'legScale', value: number) => {
        setFormData(prev => ({
            ...prev,
            body: {
                ...prev.body,
                [prop]: value,
            }
        }));
    };
    
    const handleColorChange = (color: string) => {
        setFormData(prev => ({ ...prev, colorHex: color }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#171a21] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors z-10">
                    <XIcon className="h-6 w-6" />
                </button>
                <div className="w-2/3 h-full" ref={mountRef}></div>
                <div className="w-1/3 bg-[#0d1117] p-6 overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 text-white">Edit Avatar</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Agent Name</label>
                          <p className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white">{formData.name}</p>
                        </div>
                        <div>
                          <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                          <input type="color" name="color" id="color" value={formData.colorHex} onChange={(e) => handleColorChange(e.target.value)} className="w-full h-10 p-1 bg-[#2a2f3b] border border-gray-600 rounded-md cursor-pointer"/>
                        </div>
                         <div>
                          <label htmlFor="torsoScale" className="block text-sm font-medium text-gray-300">Torso Height</label>
                          <input type="range" min="0.8" max="1.2" step="0.01" value={formData.body?.torsoScale || 1} onChange={e => handleBodyChange('torsoScale', parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                        <div>
                          <label htmlFor="armScale" className="block text-sm font-medium text-gray-300">Arm Length</label>
                          <input type="range" min="0.8" max="1.2" step="0.01" value={formData.body?.armScale || 1} onChange={e => handleBodyChange('armScale', parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                        <div>
                          <label htmlFor="legScale" className="block text-sm font-medium text-gray-300">Leg Length</label>
                          <input type="range" min="0.8" max="1.2" step="0.01" value={formData.body?.legScale || 1} onChange={e => handleBodyChange('legScale', parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
