/**
 * 移动端响应式工具类
 * 提供设备检测、屏幕尺寸判断、触摸事件处理等功能
 */

/**
 * 断点配置
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536
}

/**
 * 设备类型检测
 */
export const device = {
  /**
   * 是否为移动设备
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  /**
   * 是否为iOS设备
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
  },

  /**
   * 是否为Android设备
   */
  isAndroid() {
    return /Android/i.test(navigator.userAgent)
  },

  /**
   * 是否为平板
   */
  isTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
  },

  /**
   * 是否为微信浏览器
   */
  isWeChat() {
    return /MicroMessenger/i.test(navigator.userAgent)
  },

  /**
   * 获取设备像素比
   */
  getPixelRatio() {
    return window.devicePixelRatio || 1
  }
}

/**
 * 屏幕尺寸判断
 */
export const screen = {
  /**
   * 获取当前窗口宽度
   */
  getWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  },

  /**
   * 获取当前窗口高度
   */
  getHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  },

  /**
   * 是否为小屏设备 (< 640px)
   */
  isXS() {
    return this.getWidth() < breakpoints.sm
  },

  /**
   * 是否为小屏设备 (>= 640px)
   */
  isSM() {
    return this.getWidth() >= breakpoints.sm && this.getWidth() < breakpoints.md
  },

  /**
   * 是否为中等屏幕 (>= 768px)
   */
  isMD() {
    return this.getWidth() >= breakpoints.md && this.getWidth() < breakpoints.lg
  },

  /**
   * 是否为大屏幕 (>= 1024px)
   */
  isLG() {
    return this.getWidth() >= breakpoints.lg && this.getWidth() < breakpoints.xl
  },

  /**
   * 是否为超大屏幕 (>= 1280px)
   */
  isXL() {
    return this.getWidth() >= breakpoints.xl && this.getWidth() < breakpoints.xxl
  },

  /**
   * 是否为超超大屏幕 (>= 1536px)
   */
  isXXL() {
    return this.getWidth() >= breakpoints.xxl
  },

  /**
   * 是否为移动端尺寸 (< 768px)
   */
  isMobileSize() {
    return this.getWidth() < breakpoints.md
  },

  /**
   * 是否为桌面端尺寸 (>= 1024px)
   */
  isDesktopSize() {
    return this.getWidth() >= breakpoints.lg
  },

  /**
   * 判断是否为横屏
   */
  isLandscape() {
    return window.matchMedia('(orientation: landscape)').matches
  },

  /**
   * 判断是否为竖屏
   */
  isPortrait() {
    return window.matchMedia('(orientation: portrait)').matches
  }
}

/**
 * 触摸事件处理
 */
export const touch = {
  /**
   * 获取触摸点坐标
   */
  getPosition(event) {
    const touch = event.touches ? event.touches[0] : event
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  },

  /**
   * 计算两点距离
   */
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  },

  /**
   * 禁用页面滚动
   */
  disableScroll() {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  },

  /**
   * 启用页面滚动
   */
  enableScroll() {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  }
}

/**
 * 响应式监听器
 */
export class ResponsiveWatcher {
  constructor() {
    this.listeners = []
    this.currentSize = this.getCurrentSize()
    this.init()
  }

  /**
   * 获取当前尺寸断点
   */
  getCurrentSize() {
    const width = screen.getWidth()
    if (width < breakpoints.sm) return 'xs'
    if (width < breakpoints.md) return 'sm'
    if (width < breakpoints.lg) return 'md'
    if (width < breakpoints.xl) return 'lg'
    if (width < breakpoints.xxl) return 'xl'
    return 'xxl'
  }

  /**
   * 初始化监听
   */
  init() {
    let resizeTimer = null
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const newSize = this.getCurrentSize()
        if (newSize !== this.currentSize) {
          const oldSize = this.currentSize
          this.currentSize = newSize
          this.notify(newSize, oldSize)
        }
      }, 150)
    })
  }

  /**
   * 添加监听器
   */
  on(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }

  /**
   * 通知所有监听器
   */
  notify(newSize, oldSize) {
    this.listeners.forEach(callback => {
      callback(newSize, oldSize)
    })
  }

  /**
   * 销毁
   */
  destroy() {
    this.listeners = []
  }
}

/**
 * 创建单例
 */
export const responsiveWatcher = new ResponsiveWatcher()

/**
 * Vue Mixin - 响应式支持
 */
export const responsiveMixin = {
  data() {
    return {
      $screen: {
        width: screen.getWidth(),
        height: screen.getHeight(),
        size: responsiveWatcher.currentSize,
        isMobile: screen.isMobileSize(),
        isDesktop: screen.isDesktopSize()
      }
    }
  },

  mounted() {
    // 监听尺寸变化
    this.$_responsiveUnwatch = responsiveWatcher.on((newSize) => {
      this.$screen = {
        width: screen.getWidth(),
        height: screen.getHeight(),
        size: newSize,
        isMobile: screen.isMobileSize(),
        isDesktop: screen.isDesktopSize()
      }
      
      // 触发自定义钩子
      if (this.onScreenSizeChange) {
        this.onScreenSizeChange(newSize)
      }
    })
  },

  beforeDestroy() {
    // 取消监听
    if (this.$_responsiveUnwatch) {
      this.$_responsiveUnwatch()
    }
  }
}

/**
 * 工具函数：动态设置根元素字体大小（rem适配）
 */
export function setRootFontSize(designWidth = 1920, maxFontSize = 16, minFontSize = 12) {
  const updateFontSize = () => {
    const width = screen.getWidth()
    let fontSize = (width / designWidth) * 16
    
    // 限制最大最小值
    fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize))
    
    document.documentElement.style.fontSize = fontSize + 'px'
  }

  updateFontSize()
  window.addEventListener('resize', updateFontSize)
  
  return () => {
    window.removeEventListener('resize', updateFontSize)
  }
}

/**
 * 工具函数：防止iOS页面橡皮筋效果
 */
export function preventIOSBounce() {
  if (!device.isIOS()) return

  let startY = 0

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY
  }, { passive: false })

  document.addEventListener('touchmove', (e) => {
    const element = e.target
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const offsetHeight = element.offsetHeight
    const deltaY = e.touches[0].pageY - startY

    // 如果元素不可滚动，阻止默认行为
    if (scrollHeight <= offsetHeight) {
      e.preventDefault()
      return
    }

    // 如果到达顶部或底部，阻止默认行为
    if ((scrollTop <= 0 && deltaY > 0) || (scrollTop + offsetHeight >= scrollHeight && deltaY < 0)) {
      e.preventDefault()
    }
  }, { passive: false })
}

/**
 * 工具函数：设置viewport
 */
export function setViewport(options = {}) {
  const {
    width = 'device-width',
    initialScale = 1.0,
    maximumScale = 1.0,
    minimumScale = 1.0,
    userScalable = 'no'
  } = options

  let viewport = document.querySelector('meta[name="viewport"]')
  
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.name = 'viewport'
    document.head.appendChild(viewport)
  }

  viewport.content = `width=${width}, initial-scale=${initialScale}, maximum-scale=${maximumScale}, minimum-scale=${minimumScale}, user-scalable=${userScalable}`
}

/**
 * 工具函数：判断元素是否在可视区域
 */
export function isInViewport(element, offset = 0) {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  const windowHeight = screen.getHeight()
  const windowWidth = screen.getWidth()

  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= windowHeight + offset &&
    rect.right <= windowWidth + offset
  )
}

/**
 * 工具函数：平滑滚动到元素
 */
export function scrollToElement(element, offset = 0, behavior = 'smooth') {
  if (!element) return

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  const offsetPosition = elementPosition - offset

  window.scrollTo({
    top: offsetPosition,
    behavior
  })
}

export default {
  breakpoints,
  device,
  screen,
  touch,
  responsiveWatcher,
  responsiveMixin,
  setRootFontSize,
  preventIOSBounce,
  setViewport,
  isInViewport,
  scrollToElement
}
