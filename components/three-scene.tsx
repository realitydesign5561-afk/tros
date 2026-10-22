'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  Box,
  Camera,
  ChevronDown,
  ChevronUp,
  Layers,
  Maximize2,
  Minimize2,
  Palette,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'

// Reusable math objects at module scope for zero Garbage Collection
const _v1 = new THREE.Vector3()
const _v2 = new THREE.Vector3()

export interface MaterialTheme {
  id: string
  name: string
  chassisColor: number
  chassisRoughness: number
  chassisMetalness: number
  accentColor: number
  accentRoughness: number
  accentMetalness: number
  coreColor: number
  emissiveColor: number
  emissiveIntensity: number
  swatchBg: string
}

export const THEMES: MaterialTheme[] = [
  {
    id: 'obsidian-gold',
    name: 'Obsidian & 24K Gold',
    chassisColor: 0x141416,
    chassisRoughness: 0.2,
    chassisMetalness: 0.9,
    accentColor: 0xd4af37,
    accentRoughness: 0.15,
    accentMetalness: 0.95,
    coreColor: 0xffdf78,
    emissiveColor: 0xffaa00,
    emissiveIntensity: 0.6,
    swatchBg: 'linear-gradient(135deg, #18181b 50%, #d4af37 50%)',
  },
  {
    id: 'titanium-cyan',
    name: 'Titanium & Electric Cyan',
    chassisColor: 0x3a4048,
    chassisRoughness: 0.35,
    chassisMetalness: 0.85,
    accentColor: 0x00f0ff,
    accentRoughness: 0.1,
    accentMetalness: 0.9,
    coreColor: 0x55ffff,
    emissiveColor: 0x00e1ff,
    emissiveIntensity: 0.8,
    swatchBg: 'linear-gradient(135deg, #3a4048 50%, #00f0ff 50%)',
  },
  {
    id: 'rose-ruby',
    name: 'Rose Gold & Ruby Core',
    chassisColor: 0xb76e79,
    chassisRoughness: 0.25,
    chassisMetalness: 0.88,
    accentColor: 0xff2a55,
    accentRoughness: 0.15,
    accentMetalness: 0.7,
    coreColor: 0xff5577,
    emissiveColor: 0xff0033,
    emissiveIntensity: 0.9,
    swatchBg: 'linear-gradient(135deg, #b76e79 50%, #ff2a55 50%)',
  },
  {
    id: 'stealth-emerald',
    name: 'Stealth & Deep Emerald',
    chassisColor: 0x0f1715,
    chassisRoughness: 0.45,
    chassisMetalness: 0.6,
    accentColor: 0x10b981,
    accentRoughness: 0.18,
    accentMetalness: 0.85,
    coreColor: 0x34d399,
    emissiveColor: 0x059669,
    emissiveIntensity: 0.7,
    swatchBg: 'linear-gradient(135deg, #0f1715 50%, #10b981 50%)',
  },
]

export function ThreeSceneStudio() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)
  const [explodedAmount, setExplodedAmount] = useState(0)
  const [currentTheme, setCurrentTheme] = useState<MaterialTheme>(THEMES[0])
  const [activeCamPreset, setActiveCamPreset] = useState<'cinematic' | 'top' | 'front' | 'detail'>('cinematic')
  const [rotationSpeed, setRotationSpeed] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Internal mutable animation refs
  const sceneState = useRef({
    explodedTarget: 0,
    explodedCurrent: 0,
    rotSpeed: 1,
    camPreset: 'cinematic' as 'cinematic' | 'top' | 'front' | 'detail',
    camTargetPos: new THREE.Vector3(7, 5, 9),
    camTargetLook: new THREE.Vector3(0, 1.8, 0),
    parts: [] as { mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[],
    materials: {
      chassis: null as THREE.MeshStandardMaterial | null,
      accent: null as THREE.MeshStandardMaterial | null,
      core: null as THREE.MeshStandardMaterial | null,
    },
    audioCtx: null as AudioContext | null,
    audioGain: null as GainNode | null,
    audioOsc: null as OscillatorNode | null,
  })

  // Sync state to ref
  useEffect(() => {
    sceneState.current.explodedTarget = explodedAmount
  }, [explodedAmount])

  useEffect(() => {
    sceneState.current.rotSpeed = rotationSpeed
  }, [rotationSpeed])

  // Update materials when theme changes
  useEffect(() => {
    const mats = sceneState.current.materials
    if (mats.chassis) {
      mats.chassis.color.setHex(currentTheme.chassisColor)
      mats.chassis.roughness = currentTheme.chassisRoughness
      mats.chassis.metalness = currentTheme.chassisMetalness
    }
    if (mats.accent) {
      mats.accent.color.setHex(currentTheme.accentColor)
      mats.accent.roughness = currentTheme.accentRoughness
      mats.accent.metalness = currentTheme.accentMetalness
    }
    if (mats.core) {
      mats.core.color.setHex(currentTheme.coreColor)
      mats.core.emissive.setHex(currentTheme.emissiveColor)
      mats.core.emissiveIntensity = currentTheme.emissiveIntensity
    }
  }, [currentTheme])

  // Camera presets
  const handleCamPreset = (preset: 'cinematic' | 'top' | 'front' | 'detail') => {
    setActiveCamPreset(preset)
    sceneState.current.camPreset = preset
    if (preset === 'cinematic') {
      sceneState.current.camTargetPos.set(7, 4.5, 8.5)
      sceneState.current.camTargetLook.set(0, 1.8, 0)
    } else if (preset === 'top') {
      sceneState.current.camTargetPos.set(0.1, 12, 0.1)
      sceneState.current.camTargetLook.set(0, 1.8, 0)
    } else if (preset === 'front') {
      sceneState.current.camTargetPos.set(0, 2.2, 9)
      sceneState.current.camTargetLook.set(0, 1.8, 0)
    } else if (preset === 'detail') {
      sceneState.current.camTargetPos.set(2.4, 2.2, 3)
      sceneState.current.camTargetLook.set(0, 1.8, 0)
    }
  }

  // Audio synthesis helper (Web Audio API, zero 404 dependencies)
  const toggleAudio = () => {
    if (!soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContextClass()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(55, ctx.currentTime) // Low resonant hum (A1)

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(280, ctx.currentTime)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        osc.start()

        sceneState.current.audioCtx = ctx
        sceneState.current.audioGain = gain
        sceneState.current.audioOsc = osc
        setSoundEnabled(true)
      } catch (err) {
        console.error('Audio init error:', err)
      }
    } else {
      if (sceneState.current.audioCtx) {
        sceneState.current.audioCtx.close().catch(() => {})
        sceneState.current.audioCtx = null
      }
      setSoundEnabled(false)
    }
  }

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1. Detect software WebGL per Three.js skill directive
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2')
      if (!gl) return true
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER
      const gpu = String(gl.getParameter(param))
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu)
    })()

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0c0b)
    scene.fog = new THREE.FogExp2(0x0a0c0b, 0.035)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60)
    camera.position.set(7, 4.5, 8.5)
    camera.lookAt(0, 1.8, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = !isSoftwareGl
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // 2. Mandatory RoomEnvironment PMREM per Three.js skill directive
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
    pmremGenerator.dispose()

    // 3. Studio Lighting Rig: Warm key light, cool hemisphere fill
    const keyLight = new THREE.DirectionalLight(0xfff1e0, 2.5)
    keyLight.position.set(6, 9, 6)
    keyLight.castShadow = !isSoftwareGl
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024
      keyLight.shadow.mapSize.height = 1024
      keyLight.shadow.bias = -0.0005
      keyLight.shadow.normalBias = 0.02
      keyLight.shadow.camera.near = 0.5
      keyLight.shadow.camera.far = 25
      keyLight.shadow.camera.left = -5
      keyLight.shadow.camera.right = 5
      keyLight.shadow.camera.top = 5
      keyLight.shadow.camera.bottom = -5
    }
    scene.add(keyLight)

    const hemiLight = new THREE.HemisphereLight(0x7090b0, 0x181c20, 1.2)
    scene.add(hemiLight)

    const rimLight = new THREE.DirectionalLight(0x90c0ff, 1.5)
    rimLight.position.set(-7, 5, -6)
    scene.add(rimLight)

    // 4. Ground Shadow Plate (Zero 404s, procedural radial canvas)
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const sCtx = shadowCanvas.getContext('2d')
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)')
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      sCtx.fillStyle = grad
      sCtx.fillRect(0, 0, 256, 256)
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas)
    shadowTex.colorSpace = THREE.SRGBColorSpace

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      })
    )
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.y = 0.01
    scene.add(shadowPlane)

    // Floor subtle circular benchmark grid
    const floorGeo = new THREE.RingGeometry(0.5, 4.5, 64)
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x222624,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })
    const floorMesh = new THREE.Mesh(floorGeo, floorMat)
    floorMesh.rotation.x = -Math.PI / 2
    floorMesh.position.y = 0.02
    scene.add(floorMesh)

    // 5. Hero Subject: Composite 3–12 Part Procedural Artifact
    // TROS Neural Kinetic Core (9 hierarchical distinct components)
    const heroGroup = new THREE.Group()
    heroGroup.position.set(0, 0, 0)
    scene.add(heroGroup)

    const initialTheme = THEMES[0]
    const chassisMat = new THREE.MeshStandardMaterial({
      color: initialTheme.chassisColor,
      roughness: initialTheme.chassisRoughness,
      metalness: initialTheme.chassisMetalness,
    })
    const accentMat = new THREE.MeshStandardMaterial({
      color: initialTheme.accentColor,
      roughness: initialTheme.accentRoughness,
      metalness: initialTheme.accentMetalness,
    })
    const coreMat = new THREE.MeshStandardMaterial({
      color: initialTheme.coreColor,
      emissive: initialTheme.emissiveColor,
      emissiveIntensity: initialTheme.emissiveIntensity,
      roughness: 0.1,
      metalness: 0.2,
    })

    sceneState.current.materials.chassis = chassisMat
    sceneState.current.materials.accent = accentMat
    sceneState.current.materials.core = coreMat

    const partsRecord: { mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = []

    // Part 1: Heavy Grounded Pedestal Base (Primary silhouette)
    const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.1, 0.45, 32), chassisMat)
    basePillar.position.set(0, 0.225, 0)
    basePillar.castShadow = !isSoftwareGl
    basePillar.receiveShadow = !isSoftwareGl
    heroGroup.add(basePillar)
    partsRecord.push({ mesh: basePillar, basePos: basePillar.position.clone(), explodeDir: new THREE.Vector3(0, -0.8, 0) })

    // Part 2: Beveled Armature Support Ring
    const supportRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.14, 16, 48), accentMat)
    supportRing.rotation.x = Math.PI / 2
    supportRing.position.set(0, 0.52, 0)
    supportRing.castShadow = !isSoftwareGl
    heroGroup.add(supportRing)
    partsRecord.push({ mesh: supportRing, basePos: supportRing.position.clone(), explodeDir: new THREE.Vector3(0, -0.4, 0) })

    // Part 3: Lower Rotor with 6 Stator Fins (Secondary silhouette)
    const lowerRotorGroup = new THREE.Group()
    lowerRotorGroup.position.set(0, 1.1, 0)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.4), chassisMat)
      fin.position.set(Math.cos(angle) * 1.1, 0, Math.sin(angle) * 1.1)
      fin.rotation.y = -angle
      fin.castShadow = !isSoftwareGl
      lowerRotorGroup.add(fin)
    }
    heroGroup.add(lowerRotorGroup)
    partsRecord.push({ mesh: lowerRotorGroup, basePos: lowerRotorGroup.position.clone(), explodeDir: new THREE.Vector3(0, -0.6, 0) })

    // Part 4: Central Luminescent Crystal Core (Hero focal heart)
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 1), coreMat)
    coreMesh.position.set(0, 1.9, 0)
    heroGroup.add(coreMesh)
    partsRecord.push({ mesh: coreMesh, basePos: coreMesh.position.clone(), explodeDir: new THREE.Vector3(0, 0, 0) })

    // Part 5: Inner Magnetic Accelerator Gimbal
    const innerGimbal = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 16, 64), accentMat)
    innerGimbal.position.set(0, 1.9, 0)
    innerGimbal.castShadow = !isSoftwareGl
    heroGroup.add(innerGimbal)
    partsRecord.push({ mesh: innerGimbal, basePos: innerGimbal.position.clone(), explodeDir: new THREE.Vector3(0.5, 0.3, 0) })

    // Part 6: Outer Orbital Gyroscopic Ring
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.1, 16, 64), chassisMat)
    outerRing.position.set(0, 1.9, 0)
    outerRing.castShadow = !isSoftwareGl
    heroGroup.add(outerRing)
    partsRecord.push({ mesh: outerRing, basePos: outerRing.position.clone(), explodeDir: new THREE.Vector3(0, 0.5, 0.6) })

    // Part 7: Satellite Sensor Domes (Accent detail)
    const satelliteGroup = new THREE.Group()
    satelliteGroup.position.set(0, 1.9, 0)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4 + Math.PI / 4
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), accentMat)
      dome.position.set(Math.cos(angle) * 1.85, 0, Math.sin(angle) * 1.85)
      dome.castShadow = !isSoftwareGl
      satelliteGroup.add(dome)
    }
    heroGroup.add(satelliteGroup)
    partsRecord.push({ mesh: satelliteGroup, basePos: satelliteGroup.position.clone(), explodeDir: new THREE.Vector3(0.7, 0, 0.7) })

    // Part 8: Upper Harmonic Radiator Shroud
    const upperShroud = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 0.55, 24), chassisMat)
    upperShroud.position.set(0, 2.75, 0)
    upperShroud.castShadow = !isSoftwareGl
    heroGroup.add(upperShroud)
    partsRecord.push({ mesh: upperShroud, basePos: upperShroud.position.clone(), explodeDir: new THREE.Vector3(0, 0.8, 0) })

    // Part 9: Crown Emitter Array & Spike Antenna
    const crownGroup = new THREE.Group()
    crownGroup.position.set(0, 3.2, 0)
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 16), accentMat)
    crownGroup.add(spike)
    heroGroup.add(crownGroup)
    partsRecord.push({ mesh: crownGroup, basePos: crownGroup.position.clone(), explodeDir: new THREE.Vector3(0, 1.4, 0) })

    sceneState.current.parts = partsRecord

    // 6. Interaction: Mouse drag to rotate view
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0
    let manualRotY = 0
    let manualRotX = 0

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      prevMouseX = clientX
      prevMouseY = clientY
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const deltaX = clientX - prevMouseX
      const deltaY = clientY - prevMouseY
      prevMouseX = clientX
      prevMouseY = clientY

      manualRotY += deltaX * 0.005
      manualRotX = Math.max(-0.6, Math.min(0.8, manualRotX + deltaY * 0.005))
    }

    const onPointerUp = () => {
      isDragging = false
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)

    dom.addEventListener('touchstart', onPointerDown)
    window.addEventListener('touchmove', onPointerMove)
    window.addEventListener('touchend', onPointerUp)

    // Keyboard 'H' shortcut to collapse controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setControlsCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)

    // Handle Window Resize
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // 7. Render Loop with Exponential Damping & Software WebGL pacing
    let frameId = 0
    let lastTime = performance.now()

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null
      gl.flush()
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS)
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5)
        } else {
          if (sync) gl.deleteSync(sync)
          frameId = window.setTimeout(cb, 80)
        }
      }
      frameId = window.setTimeout(poll, 5)
    }

    const renderTick = () => {
      const now = performance.now()
      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // Smooth exponential damping for exploded view
      sceneState.current.explodedCurrent = THREE.MathUtils.damp(
        sceneState.current.explodedCurrent,
        sceneState.current.explodedTarget,
        6,
        delta
      )

      const exp = sceneState.current.explodedCurrent

      // Apply exploded offsets to all 9 parts
      for (const p of sceneState.current.parts) {
        _v1.copy(p.explodeDir).multiplyScalar(exp * 1.5)
        p.mesh.position.copy(p.basePos).add(_v1)
      }

      // Procedural rotational animation of mechanical gears/rings
      const rotDelta = delta * sceneState.current.rotSpeed
      innerGimbal.rotation.x += rotDelta * 1.2
      innerGimbal.rotation.y += rotDelta * 0.9
      outerRing.rotation.y -= rotDelta * 0.7
      outerRing.rotation.z += rotDelta * 0.5
      lowerRotorGroup.rotation.y += rotDelta * 0.8
      satelliteGroup.rotation.y -= rotDelta * 0.4
      coreMesh.rotation.y += rotDelta * 1.5
      coreMesh.rotation.x += rotDelta * 0.6

      // Base whole artifact subtle rotation when not dragging
      if (!isDragging) {
        manualRotY += rotDelta * 0.2
      }
      heroGroup.rotation.y = manualRotY
      heroGroup.rotation.x = manualRotX

      // Smooth camera position and lookAt damping
      camera.position.x = THREE.MathUtils.damp(camera.position.x, sceneState.current.camTargetPos.x, 4, delta)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, sceneState.current.camTargetPos.y, 4, delta)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, sceneState.current.camTargetPos.z, 4, delta)
      camera.lookAt(sceneState.current.camTargetLook)

      renderer.render(scene, camera)

      if (isSoftwareGl) {
        afterDraw(renderTick)
      } else {
        frameId = requestAnimationFrame(renderTick)
      }
    }

    renderTick()

    // Cleanup on unmount
    return () => {
      if (isSoftwareGl) {
        clearTimeout(frameId)
      } else {
        cancelAnimationFrame(frameId)
      }
      dom.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      dom.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)

      if (sceneState.current.audioCtx) {
        sceneState.current.audioCtx.close().catch(() => {})
      }

      renderer.dispose()
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom)
      }
    }
  }, [])

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] overflow-hidden bg-[#0a0c0b] select-none">
      {/* 100% Unobstructed 3D Viewport Canvas */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full" />

      {/* Top Left Spec Badge - Clean, Minimal, No Pulsating Dots */}
      <div className="absolute top-5 left-6 z-20 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/10 text-[#eaf79f] px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
            TROS PBR Studio
          </span>
          <span className="text-xs font-semibold text-white/70">Neural Kinetic Core v4</span>
        </div>
        <p className="text-[11px] text-white/40 max-w-xs mt-0.5">
          9-Part Composite Procedural Artifact · ACES Filmic PBR · Studio RoomEnvironment
        </p>
      </div>

      {/* Top Right Quick Hint */}
      <div className="absolute top-5 right-6 z-20 pointer-events-none hidden sm:flex items-center gap-2 text-[11px] text-white/50 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
        <span>Click & drag to orbit</span>
        <span className="w-1 h-1 rounded-full bg-white/30" />
        <span>Press &apos;H&apos; to toggle HUD</span>
      </div>

      {/* Sleek Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 transition-all duration-300 ease-out ${
          controlsCollapsed ? 'translate-y-[calc(100%-12px)] opacity-85' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="bg-[#141615]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-4 sm:p-5 shadow-2xl text-white">
          {/* Collapse/Expand Toggle Tab */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#eaf79f]" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Core Interactive Controls
              </span>
            </div>

            <button
              onClick={() => setControlsCollapsed(!controlsCollapsed)}
              className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition"
              title="Toggle HUD (Shortcut: H)"
            >
              {controlsCollapsed ? (
                <>
                  <ChevronUp className="size-3.5" />
                  <span>Show Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* 1. Exploded View Slider */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/80 flex items-center gap-1.5">
                  <Layers className="size-3.5 text-[#eaf79f]" /> Exploded View
                </span>
                <span className="font-mono text-[11px] text-white/60">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedAmount}
                onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                className="w-full accent-[#eaf79f] cursor-pointer h-1.5 bg-white/20 rounded-lg"
              />
            </div>

            {/* 2. Material Finish Swatches */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/80 flex items-center gap-1.5">
                  <Palette className="size-3.5 text-[#eaf79f]" /> Finishes
                </span>
                <span className="text-[10px] text-white/50 truncate max-w-[90px]">
                  {currentTheme.name.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme)}
                    className={`size-6 rounded-full border-2 transition-all ${
                      currentTheme.id === theme.id
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ background: theme.swatchBg }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* 3. Camera Angle Pills */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5">
              <span className="font-semibold text-xs text-white/80 flex items-center gap-1.5">
                <Camera className="size-3.5 text-[#eaf79f]" /> Camera Angles
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  onClick={() => handleCamPreset('cinematic')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition ${
                    activeCamPreset === 'cinematic' ? 'bg-[#eaf79f] text-black font-bold' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Cinematic
                </button>
                <button
                  onClick={() => handleCamPreset('top')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition ${
                    activeCamPreset === 'top' ? 'bg-[#eaf79f] text-black font-bold' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Top Down
                </button>
                <button
                  onClick={() => handleCamPreset('front')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition ${
                    activeCamPreset === 'front' ? 'bg-[#eaf79f] text-black font-bold' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => handleCamPreset('detail')}
                  className={`py-1 px-1.5 rounded-lg font-medium transition ${
                    activeCamPreset === 'detail' ? 'bg-[#eaf79f] text-black font-bold' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Core Macro
                </button>
              </div>
            </div>

            {/* 4. Motion & Audio Synthesizer */}
            <div className="space-y-1.5 bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white/80 flex items-center gap-1.5">
                  <Play className="size-3.5 text-[#eaf79f]" /> Kinetics & Sound
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  onClick={() => setRotationSpeed((s) => (s === 0 ? 1 : s === 1 ? 2 : 0))}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-center transition"
                >
                  {rotationSpeed === 0 ? 'Paused' : `${rotationSpeed}x Speed`}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-1.5 rounded-lg border transition flex items-center justify-center ${
                    soundEnabled
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                  }`}
                  title={soundEnabled ? 'Mute Procedural Audio' : 'Enable Procedural Synthesizer Audio'}
                >
                  {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
