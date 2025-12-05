/**
 * 低侵入 Three.js 科技感背景
 * - 仅点、线、轻量涟漪（无重模型，轻量 GPU 占用）
 * - 自动适配浅/深色主题（依据 html/body 的 dark-mode / theme-dark 类）
 * - pointer-events: none，不影响页面交互
 * - 提供 mount / destroy 接口，由页面控制启停
 * - by Conversation
 *
 * 可调整参数（带中文说明，便于后续手动调优）：
 * NODE_COUNT       点的数量，越大越密集，建议 120~220 之间平衡性能
 * SPACE            点分布空间尺寸，越大分布越松，单位为场景坐标
 * LINE_THRESHOLD   点之间连线的距离阈值，越大线越多，轻量建议 140~200
 * MAX_LINES        单帧最多绘制的线段数量，硬限制防止性能抖动
 * RIPPLE_LIFETIME  涟漪存活时间（秒），过长会叠加过多透明面片
 * MOUSE_INFLUENCE  鼠标微交互强度（0~1），影响点的轻微偏移与连线变化
 * CAMERA_SWAY      鼠标带动摄像机的轻微摆动幅度，建议 0~25
 */

let three = null

// 运行态缓存，便于销毁
const runtime = {
  renderer: null,
  scene: null,
  camera: null,
  points: null,
  lines: null,
  ripples: [],
  container: null,
  frameId: null,
  positions: [],
  velocities: [],
  mouse: { x: 0, y: 0, lastMove: 0 },
  observer: null
}

const NODE_COUNT = 160          // 点的数量（密度控制）
const SPACE = 600               // 点云空间尺度（值越大越疏）
const LINE_THRESHOLD = 95      // 连线距离阈值（决定连线多少）
const MAX_LINES = 300           // 最大连线数量上限（性能安全阈）
const RIPPLE_LIFETIME = 1.3     // 涟漪持续时间（秒）
const MOUSE_INFLUENCE = 0.3     // 鼠标微交互影响系数（0~1，越大越明显）
const CAMERA_SWAY = 14          // 摄像机随鼠标轻微摆动幅度

function isDarkMode() {
  const doc = document.documentElement
  return doc.classList.contains('dark-mode') || doc.classList.contains('theme-dark')
}

function getPalette() {
  const dark = isDarkMode()
  return dark
    ? {
        point: '#7dd3fc',
        line: '#60a5fa',
        ripple: '#93c5fd',
        bg: 'rgba(10, 22, 40, 0.9)'
      }
    : {
        point: '#2563eb',
        line: '#1e40af',
        ripple: '#3b82f6',
        bg: 'rgba(245, 248, 255, 0.9)'
      }
}

function createContainer() {
  const div = document.createElement('div')
  div.className = 'scifi-bg-layer'
  document.body.appendChild(div)
  return div
}

async function ensureThree() {
  if (three) return three
  three = await import('three')
  return three
}

function initScene(palette) {
  const { Scene, PerspectiveCamera, WebGLRenderer, Color, FogExp2 } = three
  runtime.scene = new Scene()
  runtime.scene.fog = new FogExp2(new Color(palette.bg), 0.0028)

  runtime.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000)
  runtime.camera.position.z = 420

  runtime.renderer = new WebGLRenderer({ antialias: true, alpha: true })
  runtime.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
  runtime.renderer.setSize(window.innerWidth, window.innerHeight)
  runtime.renderer.setClearColor(0x000000, 0)
  runtime.container.appendChild(runtime.renderer.domElement)
}

function initPointsAndLines(palette) {
  const { BufferGeometry, Float32BufferAttribute, PointsMaterial, Points, LineSegments, LineBasicMaterial } = three

  const positions = []
  const velocities = []
  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push(
      (Math.random() - 0.5) * SPACE,
      (Math.random() - 0.5) * SPACE * 0.7,
      (Math.random() - 0.5) * SPACE
    )
    velocities.push(
      (Math.random() - 0.5) * 0.08,
      (Math.random() - 0.5) * 0.08,
      (Math.random() - 0.5) * 0.08
    )
  }
  runtime.positions = positions
  runtime.velocities = velocities

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))

  const pointsMat = new PointsMaterial({
    color: palette.point,
    size: 3,
    transparent: true,
    opacity: 0.95
  })
  runtime.points = new Points(geometry, pointsMat)
  runtime.scene.add(runtime.points)

  // 预分配线段
  const lineGeometry = new BufferGeometry()
  const linePositions = new Float32Array(MAX_LINES * 6) // 两点 * 3 coords
  lineGeometry.setAttribute('position', new Float32BufferAttribute(linePositions, 3))

  const lineMat = new LineBasicMaterial({
    color: palette.line,
    transparent: true,
    opacity: 0.35,
    linewidth: 1
  })
  runtime.lines = new LineSegments(lineGeometry, lineMat)
  runtime.scene.add(runtime.lines)
}

function addEventListeners() {
  runtime._onResize = () => {
    if (!runtime.renderer || !runtime.camera) return
    runtime.camera.aspect = window.innerWidth / window.innerHeight
    runtime.camera.updateProjectionMatrix()
    runtime.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  runtime._onMouseMove = (e) => {
    runtime.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    runtime.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    runtime.mouse.lastMove = performance.now()
    spawnRipple()
  }

  runtime._onMouseLeave = () => {
    runtime.mouse.x = 0
    runtime.mouse.y = 0
    runtime.mouse.lastMove = 0
  }

  window.addEventListener('resize', runtime._onResize, { passive: true })
  window.addEventListener('mousemove', runtime._onMouseMove, { passive: true })
  window.addEventListener('mouseleave', runtime._onMouseLeave, { passive: true })
}

function spawnRipple() {
  const now = performance.now()
  if (runtime.ripples.length > 6) return

  const { PlaneGeometry, MeshBasicMaterial, Mesh } = three
  const palette = getPalette()
  const geo = new PlaneGeometry(1, 1)
  const mat = new MeshBasicMaterial({
    color: palette.ripple,
    transparent: true,
    opacity: 0.6,
    depthWrite: false
  })
  const mesh = new Mesh(geo, mat)
  mesh.position.set(
    (runtime.mouse.x || 0) * 120,
    (runtime.mouse.y || 0) * 80,
    -40 + Math.random() * 20
  )
  mesh.scale.set(1, 1, 1)
  runtime.scene.add(mesh)
  runtime.ripples.push({ mesh, born: now })
}

function updateRipples(delta) {
  const now = performance.now()
  runtime.ripples = runtime.ripples.filter((r) => {
    const age = (now - r.born) / 1000
    if (age > RIPPLE_LIFETIME) {
      runtime.scene.remove(r.mesh)
      return false
    }
    const t = age / RIPPLE_LIFETIME
    const scale = 1 + t * 40
    r.mesh.scale.set(scale, scale, scale)
    r.mesh.material.opacity = 0.6 * (1 - t)
    return true
  })
}

function updatePointsAndLines(delta) {
  const positions = runtime.positions
  const velocities = runtime.velocities
  const { attributes } = runtime.points.geometry
  const now = performance.now()

  // 鼠标微交互（随时间衰减，离开窗口回归自然漂浮）
  const influence = runtime.mouse.lastMove
    ? Math.min(1, (now - runtime.mouse.lastMove) / 900)
    : 1
  const mouseEffect = MOUSE_INFLUENCE * (1 - influence)
  const mx = runtime.mouse.x * mouseEffect
  const my = runtime.mouse.y * mouseEffect

  // 轻微偏移 + 漂浮
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += velocities[i] * delta + mx * 0.35
    positions[i + 1] += velocities[i + 1] * delta + my * 0.45
    positions[i + 2] += velocities[i + 2] * delta

    // 边界回弹
    if (Math.abs(positions[i]) > SPACE * 0.5) velocities[i] *= -1
    if (Math.abs(positions[i + 1]) > SPACE * 0.35) velocities[i + 1] *= -1
    if (Math.abs(positions[i + 2]) > SPACE * 0.5) velocities[i + 2] *= -1
  }
  attributes.position.needsUpdate = true

  // 更新线段
  const linePos = runtime.lines.geometry.attributes.position.array
  let lineCount = 0

  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (lineCount >= MAX_LINES) break
      const ix = i * 3
      const jx = j * 3
      const dx = positions[ix] - positions[jx]
      const dy = positions[ix + 1] - positions[jx + 1]
      const dz = positions[ix + 2] - positions[jx + 2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < LINE_THRESHOLD) {
        const base = lineCount * 6
        linePos[base] = positions[ix]
        linePos[base + 1] = positions[ix + 1]
        linePos[base + 2] = positions[ix + 2]
        linePos[base + 3] = positions[jx]
        linePos[base + 4] = positions[jx + 1]
        linePos[base + 5] = positions[jx + 2]
        lineCount++
      }
    }
    if (lineCount >= MAX_LINES) break
  }

  // 抹掉剩余
  for (let k = lineCount * 6; k < linePos.length; k++) {
    linePos[k] = 0
  }
  runtime.lines.geometry.setDrawRange(0, lineCount * 2)
  runtime.lines.geometry.attributes.position.needsUpdate = true
  runtime.lines.material.opacity = 0.18 + Math.min(lineCount / MAX_LINES, 1) * 0.17

  // 摄像机轻微跟随鼠标，保持安静科技感
  runtime.camera.position.x = mx * CAMERA_SWAY
  runtime.camera.position.y = my * CAMERA_SWAY
  runtime.camera.lookAt(0, 0, 0)
}

function animate() {
  const now = performance.now()
  if (!runtime._last) runtime._last = now
  // 以 60fps 基准控制步长，避免过大抖动
  const delta = Math.min((now - runtime._last) * 0.06, 5)
  runtime._last = now

  updatePointsAndLines(delta)
  updateRipples(delta)

  runtime.renderer.render(runtime.scene, runtime.camera)
  runtime.frameId = requestAnimationFrame(animate)
}

function installThemeObserver() {
  const cb = () => {
    const palette = getPalette()
    if (runtime.points?.material) runtime.points.material.color.set(palette.point)
    if (runtime.lines?.material) runtime.lines.material.color.set(palette.line)
    runtime.scene.fog?.color.set(palette.bg)
  }
  runtime.observer = new MutationObserver(cb)
  runtime.observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

export async function mountSciFiBackground() {
  if (runtime.container) return destroySciFiBackground()
  await ensureThree()

  const palette = getPalette()
  runtime.container = createContainer()
  initScene(palette)
  initPointsAndLines(palette)
  addEventListeners()
  installThemeObserver()
  animate()

  // 返回销毁函数给调用者
  return destroySciFiBackground
}

export function destroySciFiBackground() {
  if (runtime.frameId) cancelAnimationFrame(runtime.frameId)
  runtime.frameId = null
  runtime._last = null

  window.removeEventListener('resize', runtime._onResize)
  window.removeEventListener('mousemove', runtime._onMouseMove)
  window.removeEventListener('mouseleave', runtime._onMouseLeave)

  runtime._onResize = null
  runtime._onMouseMove = null
  runtime._onMouseLeave = null

  runtime.ripples.forEach((r) => runtime.scene?.remove(r.mesh))
  runtime.ripples = []

  if (runtime.scene && runtime.points) runtime.scene.remove(runtime.points)
  if (runtime.scene && runtime.lines) runtime.scene.remove(runtime.lines)
  runtime.points = null
  runtime.lines = null

  if (runtime.renderer) {
    runtime.renderer.dispose()
    runtime.renderer.forceContextLoss?.()
  }
  runtime.renderer = null
  runtime.scene = null
  runtime.camera = null

  if (runtime.container) {
    runtime.container.remove()
    runtime.container = null
  }

  if (runtime.observer) {
    runtime.observer.disconnect()
    runtime.observer = null
  }
}

