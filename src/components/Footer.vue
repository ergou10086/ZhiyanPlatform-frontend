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
  background: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
  margin: 0;
  padding: var(--space-8) 0;
  position: relative;
  z-index: var(--z-sticky);
  transition: all var(--transition-normal);
}

.footer-content {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
  text-align: center;
}

.footer-main {
  margin-bottom: var(--space-4);
}

.copyright {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin: 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.contact,
.filing {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  text-decoration: none;
  transition: color var(--transition-fast);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.contact:hover,
.filing:hover {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.separator {
  color: var(--text-disabled);
  font-size: var(--text-xs);
}

@media (max-width: 768px) {
  .footer {
    padding: var(--space-6) 0;
  }
  
  .footer-content {
    padding: 0 var(--space-4);
  }
  
  .footer-links {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .separator {
    display: none;
  }
  
  .copyright {
    font-size: var(--text-xs);
  }
  
  .contact,
  .filing {
    font-size: var(--text-xs);
  }
}
</style>
