<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Store Configuration</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding content-area">
      
      <div class="config-container">
        <p class="intro-text">Follow this sequence to configure your store's core settings.</p>

        <!-- 1. General Settings -->
        <div class="config-card">
          <div class="card-header">
            <div class="step-badge">1</div>
            <h3>General Settings</h3>
          </div>
          <p>Configure your store details, currency, and timezone.</p>
          <a :href="`https://admin.shopify.com/store/${storeSlug}/settings/general`" target="_blank" rel="noopener noreferrer" class="ghost-btn icon-btn">
            <ion-icon :icon="openOutline"></ion-icon> Open General Settings
          </a>
        </div>

        <!-- 2. Payment Gateway (Test Mode) -->
        <div class="config-card">
          <div class="card-header">
            <div class="step-badge">2</div>
            <h3>Payment Gateway</h3>
          </div>
          <p>Shopify restricts API access to Payments. You must configure this manually.</p>
          <div class="alert-box info">
            <strong>Recommendation:</strong> For testing, click below and activate the <b>"Bogus Gateway"</b> (for testing purposes).
          </div>
          <a :href="`https://admin.shopify.com/store/${storeSlug}/settings/payments`" target="_blank" rel="noopener noreferrer" class="gradient-btn outline-btn icon-btn">
            <ion-icon :icon="cardOutline"></ion-icon> Configure Payments
          </a>
        </div>

        <!-- 3. Taxes and Duties -->
        <div class="config-card">
          <div class="card-header">
            <div class="step-badge">3</div>
            <h3>Taxes and Duties</h3>
          </div>
          <p>Configure tax regions and collection rules manually in Shopify.</p>
          <a :href="`https://admin.shopify.com/store/${storeSlug}/settings/taxes`" target="_blank" rel="noopener noreferrer" class="ghost-btn icon-btn">
            <ion-icon :icon="openOutline"></ion-icon> Configure Taxes
          </a>
        </div>

        <!-- 4. Metafields -->
        <div class="config-card">
          <div class="card-header">
            <div class="step-badge">4</div>
            <h3>Metafields (Custom Data)</h3>
          </div>
          <p>Define product metafield schemas before importing catalog data.</p>
          <form @submit.prevent="handleMetafieldSubmit" class="form-grid">
            <div class="row">
              <div class="input-group half">
                <label>Namespace</label>
                <input v-model="metafieldForm.namespace" type="text" required placeholder="global" />
              </div>
              <div class="input-group half">
                <label>Key</label>
                <input v-model="metafieldForm.key" type="text" required placeholder="materials" />
              </div>
            </div>
            <div class="row">
              <div class="input-group half">
                <label>Owner Type</label>
                <select v-model="metafieldForm.ownerType" class="custom-select" required>
                  <option value="PRODUCT">Product</option>
                  <option value="PRODUCTVARIANT">Product Variant</option>
                </select>
              </div>
              <div class="input-group half">
                <label>Data Type</label>
                <select v-model="metafieldForm.type" class="custom-select" required>
                  <option value="single_line_text_field">Single Line Text</option>
                  <option value="multi_line_text_field">Multi Line Text</option>
                  <option value="number_integer">Integer Number</option>
                  <option value="boolean">Boolean (True/False)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            <div v-if="metafieldSuccess" class="success-banner">{{ metafieldSuccess }}</div>
            
            <a v-if="createdMetafieldUrl" :href="createdMetafieldUrl" target="_blank" rel="noopener noreferrer" class="ghost-btn icon-btn" style="display: flex; justify-content: center; margin-bottom: 16px;">
              <ion-icon :icon="openOutline"></ion-icon> View Metafield in Shopify
            </a>

            <div v-if="metafieldError" class="error-banner">{{ metafieldError }}</div>

            <div style="display: flex; gap: 12px; margin-top: 8px;">
              <button type="submit" class="gradient-btn small-btn" :disabled="isLoadingMetafield">
                <span v-if="isLoadingMetafield">Creating...</span>
                <span v-else>Create Definition</span>
              </button>
              
              <button type="button" @click="loadDefaultMetafields" class="ghost-btn small-btn" :disabled="isLoadingMetafield">
                Load HotWax Default Data
              </button>
            </div>
          </form>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonIcon 
} from '@ionic/vue';
import { openOutline, cardOutline } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { ShopifyService } from '../services/ShopifyService';

const authStore = useAuthStore();
const storeSlug = computed(() => {
  return authStore.storeDomain ? authStore.storeDomain.split('.')[0] : '';
});

// Carrier State
const isLoadingCarrier = ref(false);
const carrierSuccess = ref('');
const carrierError = ref('');
const carrierForm = ref({
  name: 'HotWax Express Logistics',
  callback_url: 'https://shipping.example.com/rates'
});

const handleCarrierSubmit = async () => {
  carrierSuccess.value = '';
  carrierError.value = '';
  isLoadingCarrier.value = true;
  try {
    const res = await ShopifyService.addCarrierService(carrierForm.value.name, carrierForm.value.callback_url);
    carrierSuccess.value = `Carrier '${res.name}' registered successfully!`;
  } catch (error: any) {
    carrierError.value = error.message;
  } finally {
    isLoadingCarrier.value = false;
  }
};

// Metafield State
const isLoadingMetafield = ref(false);
const metafieldSuccess = ref('');
const metafieldError = ref('');
const createdMetafieldUrl = ref('');
const metafieldForm = ref({
  namespace: 'custom',
  key: 'material',
  type: 'single_line_text_field',
  ownerType: 'PRODUCT' // Or 'PRODUCTVARIANT'
});

const handleMetafieldSubmit = async () => {
  metafieldSuccess.value = '';
  metafieldError.value = '';
  createdMetafieldUrl.value = '';
  isLoadingMetafield.value = true;
  try {
    const res = await ShopifyService.createProductMetafieldDefinition(metafieldForm.value);
    metafieldSuccess.value = `Metafield '${res.namespace}.${res.key}' created!`;
    
    // Construct the Shopify Admin URL
    if (res?.id) {
      const numericId = res.id.split('/').pop();
      const slug = storeSlug.value;
      const adminPath = metafieldForm.value.ownerType === 'PRODUCTVARIANT' ? 'productvariant' : 'product';
      createdMetafieldUrl.value = `https://admin.shopify.com/store/${slug}/settings/custom_data/${adminPath}/metafields/${numericId}`;
    }
  } catch (error: any) {
    metafieldError.value = error.message;
  } finally {
    isLoadingMetafield.value = false;
  }
};

const loadDefaultMetafields = async () => {
  metafieldSuccess.value = '';
  metafieldError.value = '';
  createdMetafieldUrl.value = '';
  isLoadingMetafield.value = true;
  
  const defaultMetafields = [
    {
      name: 'HC_PREORDER',
      namespace: 'custom',
      key: 'hc_preorder',
      type: 'json',
      description: 'Stores preorder configuration',
      ownerType: 'PRODUCTVARIANT'
    }
  ];

  try {
    for (const mf of defaultMetafields) {
      await ShopifyService.createProductMetafieldDefinition(mf);
    }
    metafieldSuccess.value = `Successfully loaded HotWax default metafields (e.g. HC_PREORDER)!`;
  } catch (error: any) {
    metafieldError.value = error.message;
  } finally {
    isLoadingMetafield.value = false;
  }
};

</script>

<style scoped>
.header-toolbar {
  --background: #151521;
  color: white;
}

.content-area {
  --background: #0f0f1a;
}

.config-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.intro-text {
  color: #a0a0b0;
  font-size: 15px;
  margin-bottom: 24px;
  text-align: center;
}

.config-card {
  background: rgba(30, 30, 40, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  color: white;
}

.config-card.disabled {
  opacity: 0.6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.step-badge {
  background: #667eea;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.config-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.config-card p {
  color: #a0a0b0;
  font-size: 14px;
  margin-bottom: 20px;
  margin-top: 0;
}

.alert-box {
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #00f2fe;
  margin-bottom: 20px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 16px;
}

.half {
  flex: 1;
}

.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #e0e0e0;
}

input, .custom-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.custom-select {
  appearance: none;
}
.custom-select option {
  background: #1e1e2d;
}

input:focus, .custom-select:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(0, 0, 0, 0.4);
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.small-btn {
  padding: 10px 16px;
  font-size: 14px;
  align-self: flex-start;
}

.outline-btn {
  background: transparent;
  border: 1px solid #667eea;
  color: #667eea;
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon-btn ion-icon {
  font-size: 18px;
}

.success-banner {
  background: rgba(48, 209, 88, 0.15);
  border: 1px solid rgba(48, 209, 88, 0.3);
  color: #30d158;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
}

.error-banner {
  background: rgba(255, 59, 48, 0.15);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff453a;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
}
</style>
