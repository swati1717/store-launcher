<template>
  <ion-page>
    <ion-content :fullscreen="true" class="space-background">
      <div class="brand-header">
        <ion-icon :icon="rocketOutline" class="brand-icon"></ion-icon>
        <span class="brand-text">Store Launcher</span>
      </div>
      <div class="glitter-container">
        <div v-for="n in 60" :key="n" class="glitter" :style="getGlitterStyle()"></div>
      </div>
      <div class="auth-container">
        <div class="glass-card">
          <div class="header">
            <h1>Connect Your Shopify Store</h1>
            <p>Securely link your Shopify store to Store Launcher to start managing products and orders.</p>
          </div>
          
          <form @submit.prevent="handleConnect">
            <div class="input-group">
              <label for="storeUrl">Shopify Store URL</label>
              <div class="input-wrapper">
                <ion-icon :icon="storefrontOutline" class="input-icon"></ion-icon>
                <input 
                  type="text" 
                  id="storeUrl"
                  v-model="storeUrl" 
                  placeholder="admin.shopify.com/store/your-store-name" 
                  required
                />
              </div>
            </div>

            <div class="input-group">
              <label for="apiToken">Admin API Token</label>
              <div class="input-wrapper">
                <ion-icon :icon="keyOutline" class="input-icon"></ion-icon>
                <input 
                  type="password" 
                  id="apiToken"
                  v-model="apiToken" 
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                  required
                />
              </div>
            </div>

            <div v-if="errorMessage" class="error-banner">
              {{ errorMessage }}
            </div>

            <button type="submit" class="gradient-btn" :disabled="isConnecting">
              <span v-if="isConnecting">Connecting...</span>
              <span v-else>Connect Store</span>
            </button>
          </form>

          <div class="footer-links">
            <a href="https://help.shopify.com/en/manual/apps/custom-apps" target="_blank" rel="noopener noreferrer">Need help finding your API key?</a>
            <a href="https://admin.shopify.com/" target="_blank" rel="noopener noreferrer" class="ghost-btn">Back to Shopify Admin</a>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonIcon } from '@ionic/vue';
import { storefrontOutline, keyOutline, rocketOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();
const storeUrl = ref('');
const apiToken = ref('');
const isConnecting = ref(false);
const errorMessage = ref('');

const handleConnect = async () => {
  if (storeUrl.value && apiToken.value) {
    isConnecting.value = true;
    errorMessage.value = '';
    
    try {
      const success = await authStore.connectStore(storeUrl.value, apiToken.value);
      if (success) {
        router.push('/dashboard');
      } else {
        errorMessage.value = 'Invalid API Token or Store URL. Please check your credentials and try again.';
      }
    } catch (error: any) {
      errorMessage.value = error.message || 'Failed to connect. Please try again.';
    } finally {
      isConnecting.value = false;
    }
  }
};

const getGlitterStyle = () => {
  const size = Math.random() * 3 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 4;
  const duration = Math.random() * 2 + 1.5;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};
</script>

<style scoped>
.space-background {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.brand-header {
  position: absolute;
  top: 32px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 2;
  color: white;
}

.brand-icon {
  font-size: 28px;
  color: #00f2fe;
}

.brand-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.glitter-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.glitter {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  opacity: 0;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.6);
  animation: sparkle linear infinite;
}

@keyframes sparkle {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 0.8; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(0); }
}

.auth-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.glass-card {
  background: rgba(30, 30, 40, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  color: white;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.header p {
  color: #a0a0b0;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #e0e0e0;
}

.error-banner {
  background: rgba(255, 59, 48, 0.15);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff453a;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  color: #808090;
}

input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px 16px 16px 48px;
  color: white;
  font-size: 16px;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

input::placeholder {
  color: #606070;
}

.gradient-btn {
  width: 100%;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.gradient-btn:active {
  transform: translateY(0);
}

.footer-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.footer-links a {
  color: #a0a0b0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: white;
}

.ghost-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
