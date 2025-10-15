<template>
  <div class="header">
    <div class="header-content">
      <span class="account-label">账户</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, 
    rgba(248, 249, 250, 0.9) 0%, 
    rgba(248, 249, 250, 0.7) 50%, 
    rgba(248, 249, 250, 0.8) 100%);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(233, 236, 239, 0.3);
  margin: 0;
  padding: 20px 0;
  box-shadow: 
    0 2px 20px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 100%);
  pointer-events: none;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.header-content {
  max-width: 1200px;
  margin: 0;
  padding: 0 20px;
}

.account-label {
  font-size: 18px;
  color: #333;
  font-weight: 600;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .header {
    padding: 15px 0;
  }
  
  .header-content {
    padding: 0 15px;
  }
  
  .account-label {
    font-size: 16px;
  }
}
</style>
