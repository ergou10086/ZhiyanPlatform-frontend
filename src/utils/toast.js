// 简单全局 Toast 工具：居中黑底白字，默认显示 1 秒

let toastTimer = null

export function showToast(message, duration = 1000) {
  if (!message) return

  // 如果已有 toast，先移除
  const existing = document.getElementById('global-simple-toast')
  if (existing) {
    existing.remove()
  }
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }

  const toast = document.createElement('div')
  toast.id = 'global-simple-toast'
  toast.textContent = message
  toast.style.position = 'fixed'
  toast.style.left = '50%'
  toast.style.top = '50%'
  toast.style.transform = 'translate(-50%, -50%)'
  toast.style.background = 'rgba(0, 0, 0, 0.8)'
  toast.style.color = '#fff'
  toast.style.padding = '10px 20px'
  toast.style.borderRadius = '6px'
  toast.style.fontSize = '14px'
  toast.style.zIndex = '99999'
  toast.style.maxWidth = '80%'
  toast.style.textAlign = 'center'
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'

  document.body.appendChild(toast)

  toastTimer = window.setTimeout(() => {
    toast.remove()
    toastTimer = null
  }, duration)
}

export default showToast
