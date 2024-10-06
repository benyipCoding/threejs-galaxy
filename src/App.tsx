import { useEffect, useRef } from "react";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

const App = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    /**
     * Base
     */
    //Debug
    const gui = new dat.GUI({ width: 360 });

    // Scene
    const scene = new THREE.Scene();

    // Galaxy
    const paramster = {
      count: 160500,
      radius: 5,
      size: 0.001,
      branches: 5,
      spin: 1,
      randomness: 0.2,
      randomnessPower: 3,
      insideColor: "#ff6030",
      outsideColor: "#1b3984",
      rotateSpeed: 0.001,
    };

    // Axes helper
    // const axesHelper = new THREE.AxesHelper();
    // scene.add(axesHelper);

    let geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes> | null =
      null;
    let material: THREE.PointsMaterial | null = null;
    let points: THREE.Points<
      THREE.BufferGeometry<THREE.NormalBufferAttributes>,
      THREE.PointsMaterial,
      THREE.Object3DEventMap
    > | null = null;
    const generateGalaxy = () => {
      if (points !== null) {
        geometry?.dispose();
        material?.dispose();
        scene.remove(points);
      }

      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(paramster.count * 3);
      const colors = new Float32Array(paramster.count * 3);
      const insideColor = new THREE.Color(paramster.insideColor);
      const outsideColor = new THREE.Color(paramster.outsideColor);

      for (let i = 0; i < paramster.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * paramster.radius;
        const spinAngle = radius * paramster.spin;
        const branchAngle =
          ((i % paramster.branches) / paramster.branches) * 2 * Math.PI;

        const randomX =
          Math.pow(Math.random(), paramster.randomnessPower) *
          (Math.random() > 0.5 ? 1 : -1);
        const randomY =
          Math.pow(Math.random(), paramster.randomnessPower) *
          (Math.random() > 0.5 ? 1 : -1);
        const randomZ =
          Math.pow(Math.random(), paramster.randomnessPower) *
          (Math.random() > 0.5 ? 1 : -1);

        positions[i3 + 0] =
          Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = 0 + randomY;
        positions[i3 + 2] =
          Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / paramster.radius);

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      material = new THREE.PointsMaterial({
        size: paramster.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };
    generateGalaxy();

    /**
     * Sizes
     */
    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    /**
     * Camera
     */

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.x = 3;
    camera.position.y = 3;
    camera.position.z = 3;
    scene.add(camera);

    // Controls
    const controls = new OrbitControls(camera, canvas.current);
    controls.enableDamping = true;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas.current!,
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Animate
    const clock = new THREE.Clock();

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();

      points!.rotation.y += paramster.rotateSpeed;

      controls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };

    tick();

    window.addEventListener("resize", () => {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      // Update camera
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // tweaks
    gui
      .add(paramster, "size")
      .min(0.001)
      .max(0.1)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui
      .add(paramster, "count")
      .min(100)
      .max(1000000)
      .step(100)
      .onFinishChange(generateGalaxy);
    gui
      .add(paramster, "radius")
      .min(0.01)
      .max(20)
      .step(0.01)
      .onFinishChange(generateGalaxy);
    gui
      .add(paramster, "branches")
      .min(2)
      .max(10)
      .step(1)
      .onFinishChange(generateGalaxy);
    gui
      .add(paramster, "spin")
      .min(-5)
      .max(5)
      .step(0.01)
      .onFinishChange(generateGalaxy);
    gui
      .add(paramster, "randomness")
      .min(0)
      .max(2)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui
      .add(paramster, "randomnessPower")
      .min(1)
      .max(10)
      .step(0.001)
      .onFinishChange(generateGalaxy);
    gui.addColor(paramster, "insideColor").onFinishChange(generateGalaxy);
    gui.addColor(paramster, "outsideColor").onFinishChange(generateGalaxy);
    gui
      .add(paramster, "rotateSpeed")
      .min(0)
      .max(0.01)
      .step(0.001)
      .onFinishChange(generateGalaxy);
  }, []);

  return <canvas className="container" ref={canvas}></canvas>;
};

export default App;
