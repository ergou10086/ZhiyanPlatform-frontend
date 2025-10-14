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
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  margin: 0;
  padding: 20px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
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
