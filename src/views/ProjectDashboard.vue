<template>
  <div class="dashboard-container">
    <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    <div class="dashboard-header">
      <button class="back" @click="$router.back()">返回</button>
      <h1 class="title">项目仪表盘</h1>
      <div class="spacer"></div>
      
    </div>

    <div class="grid kpis">
      <div class="kpi-card glow gradient-border">
        <div class="kpi-label">项目总任务数</div>
        <div class="kpi-value">{{ display.totalTasks }}</div>
        <div class="kpi-trend up">↑ 5%</div>
      </div>
      <div class="kpi-card glow gradient-border">
        <div class="kpi-label">已完成数（完成率）</div>
        <div class="kpi-value">{{ display.completed }} <span class="sub">({{ display.completeRate }}%)</span></div>
        <div class="kpi-trend up">↑ 12%</div>
      </div>
      <div class="kpi-card glow gradient-border">
        <div class="kpi-label">延期任务数</div>
        <div class="kpi-value danger">{{ display.delayed }}</div>
        <div class="kpi-trend down">↑ 12</div>
      </div>
      <div class="kpi-card glow gradient-border">
        <div class="kpi-label">本周新增任务数</div>
        <div class="kpi-value">{{ display.addedThisWeek }}</div>
        <div class="kpi-trend up">↑ 3</div>
      </div>
    </div>

    <div class="grid charts">
      <div class="card glass gradient-border">
        <div class="card-title">任务状态分布</div>
        <svg class="donut" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#2563eb"/>
            </linearGradient>
            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
            <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/>
            </linearGradient>
            <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/>
            </linearGradient>
          </defs>
          <circle class="ring" cx="60" cy="60" r="44" />
          <circle class="seg seg1" cx="60" cy="60" r="44" :stroke-dasharray="dash.todo" stroke="url(#g1)"
                  :title="`待办 ${dist.todo}%`"
                  @mouseenter="showTooltip($event,'待办', dist.todo, '%')"
                  @mousemove="showTooltip($event,'待办', dist.todo, '%')"
                  @mouseleave="hideTooltip"/>
          <circle class="seg seg2" cx="60" cy="60" r="44" :stroke-dasharray="dash.doing" stroke="url(#g2)"
                  :title="`进行中 ${dist.doing}%`"
                  @mouseenter="showTooltip($event,'进行中', dist.doing, '%')"
                  @mousemove="showTooltip($event,'进行中', dist.doing, '%')"
                  @mouseleave="hideTooltip"/>
          <circle class="seg seg3" cx="60" cy="60" r="44" :stroke-dasharray="dash.blocked" stroke="url(#g3)"
                  :title="`阻塞 ${dist.blocked}%`"
                  @mouseenter="showTooltip($event,'阻塞', dist.blocked, '%')"
                  @mousemove="showTooltip($event,'阻塞', dist.blocked, '%')"
                  @mouseleave="hideTooltip"/>
          <circle class="seg seg4" cx="60" cy="60" r="44" :stroke-dasharray="dash.done" stroke="url(#g4)"
                  :title="`已完成 ${dist.done}%`"
                  @mouseenter="showTooltip($event,'已完成', dist.done, '%')"
                  @mousemove="showTooltip($event,'已完成', dist.done, '%')"
                  @mouseleave="hideTooltip"/>
          <text x="60" y="64" text-anchor="middle" class="donut-center">分布</text>
        </svg>
        <div class="legend">
          <span class="legend-item todo">待办 {{ dist.todo }}%</span>
          <span class="legend-item doing">进行中 {{ dist.doing }}%</span>
          <span class="legend-item blocked">阻塞 {{ dist.blocked }}%</span>
          <span class="legend-item done">已完成 {{ dist.done }}%</span>
        </div>
      </div>
      <div class="card glass gradient-border">
        <div class="card-title">成员任务负载</div>
        <div class="bar-chart">
          <div v-for="(h, i) in barHeights" :key="i" class="bar-wrap">
            <div class="bar" :style="{'--h': h + '%'}" :title="`成员${i+1} 任务量 ${h}%`"
                 @mousemove="showTooltip($event, `成员${i+1} 任务量`, h, '%')" @mouseleave="hideTooltip"></div>
            <span class="bar-label">{{ h }}%</span>
          </div>
        </div>
      </div>
      <div class="card glass gradient-border">
        <div class="card-title">近 30 天完成趋势</div>
        <div class="line-chart">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline :key="lineKey" class="line" fill="none" stroke="#3b82f6" stroke-width="2"
                      points="0,30 10,20 20,26 30,12 40,16 50,10 60,14 70,8 80,12 90,6 100,12"/>
            <template v-for="(p, idx) in linePoints">
              <circle :key="'c'+idx" :cx="p.x" :cy="p.y" r="1.6" fill="#3b82f6"/>
              <text :key="'t'+idx" :x="p.x" :y="Math.max(6, p.y - 2.5)" class="line-label">{{ p.v }}</text>
            </template>
          </svg>
        </div>
      </div>
    </div>

    <div class="timeline card glass gradient-border">
      <div class="card-title">里程碑时间线</div>
      <ul class="steps">
        <li class="done">
          <div class="name">方案评审</div>
          <div class="date">2023-10-15</div>
        </li>
        <li class="done">
          <div class="name">数据采集完成</div>
          <div class="date">2023-10-28</div>
        </li>
        <li class="processing">
          <div class="name">原型设计完成</div>
          <div class="date">2023-11-05</div>
        </li>
        <li class="todo">
          <div class="name">开发启动</div>
          <div class="date">2023-11-20</div>
        </li>
      </ul>
    </div>

    <div class="card glass gradient-border">
      <div class="card-title">成果统计</div>
      <table class="table">
        <thead>
          <tr><th>成果名称</th><th>类型</th><th>负责人</th><th>状态</th><th>更新时间</th></tr>
        </thead>
        <tbody>
          <tr><td>用户画像分析报告</td><td>数据分析</td><td>李娜</td><td><span class="badge success">已发布</span></td><td>2023-11-01</td></tr>
          <tr><td>移动端交互原型</td><td>设计稿</td><td>王强</td><td><span class="badge warning">待审核</span></td><td>2023-11-03</td></tr>
          <tr><td>后端 API 文档</td><td>技术文档</td><td>赵敏</td><td><span class="badge success">已发布</span></td><td>2023-10-28</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="tooltip.show" class="tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-title">{{ tooltip.title }}</div>
      <div class="tooltip-value">{{ tooltip.value }}{{ tooltip.suffix }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectDashboard',
  data() {
    return {
      // 目标值
      kpis: {
        totalTasks: 128,
        completed: 92,
        completeRate: 72,
        delayed: 5,
        addedThisWeek: 18
      },
      // 动画展示用数字
      display: {
        totalTasks: 0,
        completed: 0,
        completeRate: 0,
        delayed: 0,
        addedThisWeek: 0
      },
      // 环形图分布（百分比）
      dist: { todo: 35, doing: 30, blocked: 10, done: 25 },
      dash: { todo: '0 276', doing: '0 276', blocked: '0 276', done: '0 276' },
      // 控件
      filters: {
        range: '30',
        groupBy: 'member'
      },
      // 背景粒子
      particles: [],
      rafId: null,
      // 动态
      barHeights: [60, 75, 70, 55, 40],
      lineKey: Date.now(),
      tickId: null,
      tooltip: { show: false, x: 0, y: 0, title: '', value: '', suffix: '' }
    }
  },
  created() {
    // 可按需通过项目ID拉取统计数据：this.$route.params.id
  },
  mounted() {
    // 数字滚动动画
    Object.keys(this.kpis).forEach(key => this.animateCount(key, this.kpis[key], 800))
    // 环形图入场
    this.animateDonut()
    // 启动粒子背景
    this.initParticles()
    window.addEventListener('resize', this.resizeCanvas)
    // 进入页面仅刷新一次
    this.tickUpdate()
  },
  beforeDestroy() {
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('resize', this.resizeCanvas)
    if (this.tickId) clearInterval(this.tickId)
  },
  computed: {
    // 用于线图文本标注（与折线坐标相匹配）
    linePoints() {
      return [
        { x: 0, y: 30, v: 3 }, { x: 10, y: 20, v: 6 }, { x: 20, y: 26, v: 5 },
        { x: 30, y: 12, v: 9 }, { x: 40, y: 16, v: 8 }, { x: 50, y: 10, v: 10 },
        { x: 60, y: 14, v: 9 }, { x: 70, y: 8, v: 11 }, { x: 80, y: 12, v: 10 },
        { x: 90, y: 6, v: 12 }, { x: 100, y: 12, v: 9 }
      ]
    }
  },
  methods: {
    refreshDash() {
      // 模拟刷新动画
      Object.keys(this.kpis).forEach(key => this.animateCount(key, this.kpis[key], 600))
      this.animateDonut()
    },
    tickUpdate() {
      // KPI 轻微波动
      const jitter = (v, p=0.03) => Math.max(0, Math.round(v * (1 + (Math.random()*2-1)*p)))
      const next = {
        totalTasks: jitter(this.kpis.totalTasks, 0.01),
        completed: jitter(this.kpis.completed, 0.02),
        completeRate: Math.min(100, Math.max(0, this.kpis.completeRate + Math.round((Math.random()*2-1)*2))),
        delayed: Math.max(0, this.kpis.delayed + Math.round((Math.random()*2-1))),
        addedThisWeek: jitter(this.kpis.addedThisWeek, 0.15)
      }
      this.kpis = next
      Object.keys(this.kpis).forEach(key => this.animateCount(key, this.kpis[key], 700))

      // 环形比例微调并归一化
      let { todo, doing, blocked, done } = this.dist
      todo = Math.max(5, todo + Math.round((Math.random()*2-1)*3))
      doing = Math.max(5, doing + Math.round((Math.random()*2-1)*3))
      blocked = Math.max(5, blocked + Math.round((Math.random()*2-1)*2))
      done = Math.max(5, done + Math.round((Math.random()*2-1)*3))
      const sum = todo + doing + blocked + done
      this.dist = {
        todo: Math.round(todo/sum*100),
        doing: Math.round(doing/sum*100),
        blocked: Math.round(blocked/sum*100),
        done: Math.max(0, 100 - (Math.round(todo/sum*100)+Math.round(doing/sum*100)+Math.round(blocked/sum*100)))
      }
      this.animateDonut()

      // 柱状高度轻微变化
      this.barHeights = this.barHeights.map(h => {
        const nh = Math.max(20, Math.min(90, h + (Math.random()*2-1)*10))
        return Math.round(nh)
      })

      // 折线重绘动画（通过更换 key 触发 stroke 动画）
      this.lineKey = Date.now()
    },
    animateCount(key, target, duration = 800) {
      const start = performance.now()
      const from = 0
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        this.display[key] = Math.round(from + (target - from) * eased)
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    },
    animateDonut() {
      const C = Math.PI * 2 * 44 // 周长
      const toDash = (p) => `${(p / 100) * C} ${C}`
      setTimeout(() => {
        this.dash = {
          todo: toDash(this.dist.todo),
          doing: toDash(this.dist.doing),
          blocked: toDash(this.dist.blocked),
          done: toDash(this.dist.done)
        }
      }, 50)
    },
    showTooltip(evt, title, value, suffix = '') {
      const margin = 14
      this.tooltip = {
        show: true,
        x: evt.clientX + margin,
        y: evt.clientY + margin,
        title,
        value,
        suffix
      }
    },
    hideTooltip() {
      this.tooltip.show = false
    },
    initParticles() {
      const canvas = this.$refs.bgCanvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const DPR = window.devicePixelRatio || 1
      const resize = () => {
        canvas.width = canvas.clientWidth * DPR
        canvas.height = canvas.clientHeight * DPR
      }
      resize()
      const count = 60
      this.particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25 * DPR,
        vy: (Math.random() - 0.5) * 0.25 * DPR,
        r: (Math.random() * 1.8 + 0.6) * DPR,
        a: Math.random() * 0.6 + 0.2
      }))
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (const p of this.particles) {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1
          ctx.beginPath()
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
          grad.addColorStop(0, `rgba(99,102,241,${p.a})`)
          grad.addColorStop(1, 'rgba(99,102,241,0)')
          ctx.fillStyle = grad
          ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
          ctx.fill()
        }
        this.rafId = requestAnimationFrame(render)
      }
      this.rafId = requestAnimationFrame(render)
      this.resizeCanvas = resize
    }
  }
}
</script>

<style scoped>
.dashboard-container{position:relative;padding:24px;min-height:100vh;background:radial-gradient(1200px 600px at 0% 0%,#eef2ff 0%,transparent 60%),radial-gradient(1200px 600px at 100% 100%,#ecfeff 0%,transparent 60%),#ffffff}
.bg-canvas{position:fixed;inset:0;z-index:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:normal}
.dashboard-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.dashboard-header .title{font-size:22px;font-weight:700;margin:0;color:#0f172a}
.dashboard-header .back{height:32px;padding:0 12px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;color:#1f2937;cursor:pointer}
/* 顶部已去除控制按钮，样式保留以便以后启用时复用 */
/* .controls{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:12px;background:rgba(255,255,255,.7);box-shadow:0 6px 20px rgba(0,0,0,.06)} */
/* .controls .btn-refresh{position:relative;height:32px;padding:0 14px;border-radius:8px;border:1px solid #bfdbfe;background:linear-gradient(90deg,#60a5fa,#3b82f6);color:white;cursor:pointer;overflow:hidden} */
/* .controls .btn-refresh .pulse{position:absolute;inset:-1px;border-radius:8px;border:1px solid rgba(99,102,241,.5);box-shadow:0 0 24px rgba(14,165,233,.35) inset} */
.spacer{flex:1}
.grid{display:grid;gap:28px} /* 放大各区块间距 */
.kpis{grid-template-columns:repeat(4,1fr)}
.kpi-card{
  background: linear-gradient(180deg,#ffffff,#fbfbff);
  border: 0;
  border-radius: 16px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  backdrop-filter: blur(4px);
  /* 立体边框效果：上下高光 + 阴影 */
  box-shadow:
    0 14px 28px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 -2px 0 rgba(226,232,240,1) inset;
}
.kpi-card.glow::after{content:'';position:absolute;inset:-1px;border-radius:12px;background:conic-gradient(from 180deg at 50% 50%,#93c5fd22,transparent,#22d3ee22,transparent);filter:blur(8px);z-index:-1}
.kpi-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(30,64,175,.12)}
.kpi-label{font-size:12px;color:#64748b;margin-bottom:8px}
.kpi-value{font-size:28px;font-weight:700;color:#0f172a;text-shadow:0 2px 18px rgba(59,130,246,.15)}
.kpi-value .sub{font-size:14px;color:#6b7280;margin-left:6px}
.kpi-trend{margin-top:6px;font-size:12px;color:#6b7280}
.kpi-trend.up{color:#16a34a}.kpi-trend.down{color:#ef4444}
.kpi-value.danger{color:#ef4444}
.charts{grid-template-columns:1fr 1fr 1fr;margin-top:8px;gap:28px} /* 放大卡片间距 */
.card{
  background: linear-gradient(180deg,#ffffff,#fbfbff);
  border: 0;
  border-radius: 16px;
  padding: 18px;
  color: #0f172a;
  backdrop-filter: blur(4px);
  /* 立体边框：柔和外阴影 + 内部顶部高光、底部浅阴影 */
  box-shadow:
    0 16px 32px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255,255,255,0.95) inset,
    0 -2px 0 rgba(226,232,240,1) inset;
}
.card-title{font-size:16px;font-weight:600;color:#0f172a;margin-bottom:12px}
.glass{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gradient-border{position:relative}
.gradient-border::before{
  content:'';position:absolute;inset:0;border-radius:16px;padding:2px;
  background:
    linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0)) border-box,
    linear-gradient(135deg,#cfe8ff 0%, #b6e3ff 30%, #a5f3fc 100%) border-box;
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;
}
.gradient-border::after{
  content:'';position:absolute;inset:4px;border-radius:12px;
  box-shadow: 0 0 0 1px rgba(226,232,240,.9) inset;
  pointer-events:none;
}
.donut{width:100%;height:220px}
.ring{fill:none;stroke:#f1f5f9;stroke-width:16}
.seg{fill:none;stroke-width:16;stroke-linecap:round;transform:rotate(-90deg);transform-origin:60px 60px;stroke-dasharray:0 276;transition:stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)}
.seg{pointer-events: stroke;} /* 确保可在描边区域捕获鼠标事件 */
.donut{pointer-events: all;}
.donut-center{font-size:12px;fill:#64748b}
.legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}
.legend-item{font-size:12px;color:#64748b;padding:2px 8px;border-radius:999px;border:1px solid #e6eaf2}
.legend-item.todo{background:#f1f5f9}
.legend-item.doing{background:#eef2ff}
.legend-item.blocked{background:#fff7ed}
.legend-item.done{background:#ecfeff}
.bar-chart{display:flex;align-items:flex-end;height:180px;gap:10px;padding:0 8px}
.bar-wrap{position:relative;flex:1;display:flex;align-items:flex-end;justify-content:center}
.bar{flex:1;background:linear-gradient(180deg,#93c5fd,#3b82f6);border-radius:6px;height:var(--h);transition:height 600ms cubic-bezier(.2,.8,.2,1);box-shadow:0 6px 18px rgba(59,130,246,.2)}
.bar-label{position:absolute;bottom:calc(var(--h) + 6px);transform:translateY(50%);font-size:12px;color:#334155;background:rgba(255,255,255,.85);padding:2px 6px;border-radius:8px;border:1px solid #e6eaf2;white-space:nowrap}
.bar::after{content:'';display:block;height:100%;background:linear-gradient(180deg,transparent 0,rgba(255,255,255,.35) 40%,transparent 100%)}
.line-chart{height:180px;background:linear-gradient(180deg,#f8fafc,#fff);border:1px dashed #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center}
.line{stroke-dasharray:200;stroke-dashoffset:200;animation:dash 1200ms ease forwards}
.line-label{font-size:3px;fill:#334155}
.timeline .steps{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}
.timeline .steps li{display:flex;align-items:center;gap:12px}
.timeline .steps .name{font-weight:600;color:#0f172a}
.timeline .steps .date{font-size:12px;color:#64748b}
.timeline .steps li::before{content:'';width:12px;height:12px;border-radius:50%;display:inline-block}
.timeline .steps li.done::before{background:#22c55e}
.timeline .steps li.processing::before{background:#f59e0b}
.timeline .steps li.todo::before{background:#e5e7eb}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid #f1f5f9;padding:10px 8px;text-align:left;font-size:13px;color:#334155}
.badge{padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600}
.badge.success{background:#dcfce7;color:#15803d}
.badge.warning{background:#fef9c3;color:#a16207}
@media (max-width: 1024px){
  .kpis{grid-template-columns:1fr 1fr}
  .charts{grid-template-columns:1fr}
}
@keyframes dash{to{stroke-dashoffset:0}}

/* 提示气泡 */
.tooltip{position:fixed;z-index:10;pointer-events:none;background:#111827;color:#fff;border-radius:8px;padding:8px 10px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
.tooltip-title{font-size:12px;color:#cbd5e1;margin-bottom:4px}
.tooltip-value{font-size:14px;font-weight:700}
</style>


