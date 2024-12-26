import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface GlobeViewProps {
  center: [number, number];
  show: boolean;
  onToggle: () => void;
}

export function GlobeView({ center, show, onToggle }: GlobeViewProps) {
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

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Setup scene
    const scene = new THREE.Scene();
    
    // Create starry background
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];
    
    for (let i = 0; i < 1000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 50 + Math.random() * 30;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      starPositions.push(x, y, z);
      
      // Random star colors (white to blue-ish)
      const r = 0.8 + Math.random() * 0.2;
      const g = 0.8 + Math.random() * 0.2;
      const b = 1.0;
      starColors.push(r, g, b);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: false,
      sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Set scene background
    const spaceTexture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/starfield.png'
    );
    scene.background = spaceTexture;

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

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x202020);
    scene.add(ambientLight);

    // Add directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    
    // Add subtle blue rim light
    const rimLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    rimLight.position.set(-5, 0, -5);
    scene.add(rimLight);

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
        // Slowly rotate stars
        if (stars) {
          stars.rotation.y += 0.0001;
        }
        globeRef.current.controls.update();
      }
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      if (!globeRef.current) return;
      const newWidth = 300;
      const newHeight = 300;
      
      globeRef.current.camera.aspect = newWidth / newHeight;
      globeRef.current.camera.updateProjectionMatrix();
      globeRef.current.renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update marker position when center changes
  useEffect(() => {
    if (!globeRef.current) return;

    const { marker } = globeRef.current;
    const [lon, lat] = center;
    
    // Convert lat/lon to 3D coordinates
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -5 * Math.sin(phi) * Math.cos(theta);
    const y = 5 * Math.cos(phi);
    const z = 5 * Math.sin(phi) * Math.sin(theta);
    
    marker.position.set(x, y, z);
  }, [center]);

  return (
    <div 
      className={`fixed left-4 top-16 z-10 transition-all duration-300 transform ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      } bg-black rounded-lg shadow-lg border border-gray-800 overflow-hidden`}
    >
      <div ref={containerRef} className="w-[300px] h-[300px]" />
    </div>
  );
}