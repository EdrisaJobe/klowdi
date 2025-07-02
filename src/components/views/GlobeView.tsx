import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface GlobeViewProps {
  center: [number, number];
  show: boolean;
}

export function GlobeView({ center, show }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sphere: THREE.Mesh;
    marker: THREE.Mesh;
    controls: OrbitControls;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = 300;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Create Earth sphere
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const texture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    );
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x202020);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(ambientLight, light);

    // Create location marker
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    scene.add(marker);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;

    camera.position.z = 15;

    globeRef.current = { scene, camera, renderer, sphere, marker, controls };

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      if (globeRef.current?.controls) {
        globeRef.current.controls.update();
      }
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
    };
  }, []);

  // Update marker position when center changes
  useEffect(() => {
    if (!globeRef.current) return;

    const { marker } = globeRef.current;
    const [lon, lat] = center;
    
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -5 * Math.sin(phi) * Math.cos(theta);
    const y = 5 * Math.cos(phi);
    const z = 5 * Math.sin(phi) * Math.sin(theta);
    
    marker.position.set(x, y, z);
  }, [center]);

  return (
    <div 
      className={`fixed left-4 top-20 sm:top-16 z-10 transition-all duration-300 transform ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      } bg-black rounded-lg shadow-lg border border-gray-800 overflow-hidden`}
    >
      <div ref={containerRef} className="w-[300px] h-[300px]" />
    </div>
  );
}