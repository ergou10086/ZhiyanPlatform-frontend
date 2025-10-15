<template>
  <div class="footer">
    <div class="footer-content">
      <div class="footer-main">
        <p class="copyright">© 2023 用户与权限服务,保留所有权利。</p>
      </div>
      <div class="footer-links">
        <span class="contact">联系方式: support@userauth.com</span>
        <span class="separator">|</span>
        <span class="filing">备案号: 京ICP备12345678号</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, 
    rgba(248, 249, 250, 0.8) 0%, 
    rgba(248, 249, 250, 0.6) 50%, 
    rgba(248, 249, 250, 0.7) 100%);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(233, 236, 239, 0.3);
  margin: 0;
  padding: 30px 0;
  box-shadow: 
    0 -2px 20px rgba(0, 0, 0, 0.05),
    0 -1px 3px rgba(0, 0, 0, 0.1),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.08) 50%, 
    transparent 100%);
  pointer-events: none;
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-main {
  margin-bottom: 15px;
}

.copyright {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.contact,
.filing {
  color: #888;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact:hover,
.filing:hover {
  color: #666;
}

.separator {
  color: #ccc;
  font-size: 12px;
}

@media (max-width: 768px) {
  .footer {
    padding: 25px 0;
  }
  
  .footer-content {
    padding: 0 15px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
  
  .separator {
    display: none;
  }
  
  .copyright {
    font-size: 13px;
  }
  
  .contact,
  .filing {
    font-size: 11px;
  }
}
</style>
