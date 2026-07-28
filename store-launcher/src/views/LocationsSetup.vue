<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Locations Setup</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding content-area">
      
      <div class="card">
        <ion-segment v-model="activeTab" class="custom-segment">
          <ion-segment-button value="single">
            <ion-label>Single Location</ion-label>
          </ion-segment-button>
          <ion-segment-button value="bulk">
            <ion-label>Bulk Upload</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Single Location Form -->
        <div v-if="activeTab === 'single'" class="tab-content">
          <p class="description">Create a single fulfillment location in Shopify.</p>
          
          <form @submit.prevent="handleSingleSubmit" class="form-grid">
            <div class="input-group">
              <label>Location Name</label>
              <input v-model="singleForm.name" type="text" required placeholder="e.g. Downtown Retail Store" />
            </div>
            
            <div class="input-group">
              <label>Address 1</label>
              <input v-model="singleForm.address.address1" type="text" required placeholder="123 Main St" />
            </div>
            
            <div class="row">
              <div class="input-group half">
                <label>City</label>
                <input v-model="singleForm.address.city" type="text" required placeholder="New York" />
              </div>
              <div class="input-group half">
                <label>Zip Code</label>
                <input v-model="singleForm.address.zip" type="text" required placeholder="10001" />
              </div>
            </div>
            
            <div class="row">
              <div class="input-group half">
                <label>Province Code (2-letter)</label>
                <input v-model="singleForm.address.provinceCode" type="text" required placeholder="NY" maxlength="2" style="text-transform: uppercase" />
              </div>
              <div class="input-group half">
                <label>Country Code</label>
                <input v-model="singleForm.address.countryCode" type="text" required placeholder="US" style="text-transform: uppercase" />
              </div>
            </div>

            <div v-if="successMessage" class="success-banner">{{ successMessage }}</div>
            
            <a v-if="createdLocationUrl" :href="createdLocationUrl" target="_blank" rel="noopener noreferrer" class="ghost-btn" style="display: block; text-align: center; margin-bottom: 16px;">
              View Location in Shopify Admin
            </a>

            <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

            <button type="submit" class="gradient-btn" :disabled="isLoading">
              <span v-if="isLoading">Creating...</span>
              <span v-else>Create Location</span>
            </button>
          </form>
        </div>

        <!-- Bulk Upload Area -->
        <div v-if="activeTab === 'bulk'" class="tab-content">
          <p class="description">Upload a JSON array of locations, or use our default HotWax test data.</p>
          
          <div class="template-section">
            <h4>Need a template?</h4>
            <p>Your JSON file should contain an array of location objects. Required fields: <code>name</code>, <code>address1</code>, <code>city</code>, <code>provinceCode</code>, <code>countryCode</code>, <code>zip</code>.</p>
            <a href="/templates/default-locations.json" target="_blank" download class="ghost-link">
              <ion-icon :icon="downloadOutline"></ion-icon> Download JSON Template
            </a>
          </div>

          <div class="upload-zone">
            <input type="file" accept=".json" @change="handleFileUpload" id="fileUpload" class="hidden-input" />
            <label for="fileUpload" class="upload-label">
              <ion-icon :icon="documentTextOutline" class="upload-icon"></ion-icon>
              <span>Click to Upload Custom JSON File</span>
            </label>
            <p class="text-sm" v-if="selectedFile">Selected: {{ selectedFile.name }}</p>
          </div>
          
          <div class="or-divider">OR</div>

          <button @click="useDefaultData" class="ghost-btn full-width" :disabled="isLoading">
            Use HotWax Default Data
          </button>

          <div v-if="successMessage" class="success-banner mt-4">{{ successMessage }}</div>
          <div v-if="errorMessage" class="error-banner mt-4">{{ errorMessage }}</div>

          <button v-if="selectedFile" @click="processBulkFile" class="gradient-btn mt-4" :disabled="isLoading">
            <span v-if="isLoading">Processing {{ processedCount }} / {{ totalCount }}...</span>
            <span v-else>Run Bulk Import</span>
          </button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonSegment, IonSegmentButton, IonLabel, IonIcon 
} from '@ionic/vue';
import { downloadOutline, documentTextOutline } from 'ionicons/icons';
import { ref } from 'vue';
import { ShopifyService } from '../services/ShopifyService';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const activeTab = ref('single');
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const createdLocationUrl = ref('');
const selectedFile = ref<File | null>(null);

// Progress counters for bulk
const processedCount = ref(0);
const totalCount = ref(0);

const singleForm = ref({
  name: '',
  address: {
    address1: '',
    city: '',
    provinceCode: '',
    countryCode: '',
    zip: ''
  },
  fulfillsOnlineOrders: true
});

const clearMessages = () => {
  successMessage.value = '';
  errorMessage.value = '';
  createdLocationUrl.value = '';
};

const handleSingleSubmit = async () => {
  clearMessages();
  isLoading.value = true;
  
  // Format to ensure uppercase 2-letter codes
  singleForm.value.address.countryCode = singleForm.value.address.countryCode.toUpperCase().trim();
  singleForm.value.address.provinceCode = singleForm.value.address.provinceCode.toUpperCase().trim();

  try {
    const loc = await ShopifyService.addLocation(singleForm.value);
    successMessage.value = `Location '${loc.name}' created successfully!`;
    
    // Construct the Shopify Admin URL
    if (loc?.id) {
      const numericId = loc.id.split('/').pop();
      const storeSlug = authStore.storeDomain.split('.')[0];
      createdLocationUrl.value = `https://admin.shopify.com/store/${storeSlug}/settings/locations/${numericId}`;
    }

    // Reset form
    singleForm.value.name = '';
    singleForm.value.address = { address1: '', city: '', provinceCode: '', countryCode: '', zip: '' };
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create location.';
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    clearMessages();
  }
};

const processLocationsList = async (locations: any[]) => {
  clearMessages();
  isLoading.value = true;
  totalCount.value = locations.length;
  processedCount.value = 0;
  
  let successes = 0;
  let errors = 0;

  for (const loc of locations) {
    try {
      await ShopifyService.addLocation(loc);
      successes++;
    } catch (e) {
      console.error(e);
      errors++;
    }
    processedCount.value++;
  }

  isLoading.value = false;
  
  if (errors > 0) {
    errorMessage.value = `Processed ${totalCount.value} locations. ${successes} succeeded, ${errors} failed. Check console for details.`;
  } else {
    successMessage.value = `Successfully created all ${successes} locations!`;
  }
  selectedFile.value = null;
};

const processBulkFile = () => {
  if (!selectedFile.value) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      const locations = JSON.parse(content);
      if (!Array.isArray(locations)) {
        throw new Error("JSON file must contain an array of locations.");
      }
      await processLocationsList(locations);
    } catch (error: any) {
      errorMessage.value = "Invalid JSON file: " + error.message;
    }
  };
  reader.readAsText(selectedFile.value);
};

const useDefaultData = async () => {
  clearMessages();
  isLoading.value = true;
  try {
    const res = await fetch('/templates/default-locations.json');
    if (!res.ok) throw new Error("Could not load default template");
    const data = await res.json();
    await processLocationsList(data);
  } catch (error: any) {
    errorMessage.value = error.message;
    isLoading.value = false;
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

.card {
  background: rgba(30, 30, 40, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  color: white;
}

.custom-segment {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

ion-segment-button {
  --color: #a0a0b0;
  --color-checked: white;
  --indicator-color: #667eea;
}

.description {
  color: #a0a0b0;
  font-size: 15px;
  margin-bottom: 24px;
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

input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
}

input:focus, .custom-select:focus {
  outline: none;
  border-color: #00f2fe;
  background: rgba(0, 0, 0, 0.4);
}

.custom-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
  appearance: none;
}
.custom-select option {
  background: #1e1e2d;
  color: white;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-top: 10px;
  width: 100%;
}

.gradient-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ghost-btn {
  background: transparent;
  color: #a0a0b0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.full-width {
  width: 100%;
}

.template-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.template-section h4 {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #00f2fe;
}

.template-section p {
  font-size: 13px;
  color: #a0a0b0;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.template-section code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  color: #e0e0e0;
}

.ghost-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.upload-zone {
  margin-bottom: 20px;
}

.hidden-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.1);
}

.upload-label:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.upload-icon {
  font-size: 32px;
  color: #667eea;
  margin-bottom: 12px;
}

.text-sm {
  font-size: 13px;
  color: #00f2fe;
  margin-top: 8px;
  text-align: center;
}

.or-divider {
  text-align: center;
  color: #a0a0b0;
  font-size: 12px;
  margin: 20px 0;
  position: relative;
}

.or-divider::before,
.or-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.or-divider::before { left: 0; }
.or-divider::after { right: 0; }

.success-banner {
  background: rgba(48, 209, 88, 0.15);
  border: 1px solid rgba(48, 209, 88, 0.3);
  color: #30d158;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.error-banner {
  background: rgba(255, 59, 48, 0.15);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff453a;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
