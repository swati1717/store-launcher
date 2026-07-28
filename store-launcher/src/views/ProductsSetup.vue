<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Products Setup</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding content-area">
      <div class="card">
        <div class="card-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div class="icon-wrapper" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            <ion-icon :icon="cubeOutline"></ion-icon>
          </div>
          <h3 style="margin: 0; font-size: 1.5rem; font-weight: 600;">Bulk Product Creation</h3>
        </div>
        
        <p class="description">
          Upload a <b>.jsonl</b> file containing <code>ProductSetInput</code> GraphQL structures to rapidly create products and variants via Shopify's Staged Uploads API.
        </p>

        <!-- Status & Progress Display -->
        <div v-if="uploadStatus !== 'IDLE'" class="status-tracker" :class="uploadStateClass">
          <h4>Status: {{ currentPhaseText }}</h4>
          <p>{{ statusMessage }}</p>
          <div class="progress-bar" v-if="uploadStatus === 'POLLING' || uploadStatus === 'UPLOADING'">
            <div class="progress-fill indeterminate"></div>
          </div>
          <div v-if="bulkError" class="error-banner" style="margin-top: 10px;">{{ bulkError }}</div>
        </div>

        <!-- Controls -->
        <div class="upload-controls" v-if="uploadStatus === 'IDLE' || uploadStatus === 'ERROR' || uploadStatus === 'COMPLETED'">
          
          <div class="template-section" style="background: rgba(0, 0, 0, 0.2); padding: 16px; border-radius: 8px; margin-bottom: 24px; margin-top: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #00f2fe;">Need a template?</h4>
            <p style="font-size: 13px; color: #a0a0b0; margin: 0 0 12px 0; line-height: 1.5;">
              Your JSONL file should contain a single GraphQL <code>ProductSetInput</code> object per line.
            </p>
            <a href="/templates/default-products.jsonl" target="_blank" download class="ghost-link" style="display: inline-flex; align-items: center; gap: 6px; color: #667eea; text-decoration: none; font-size: 14px; font-weight: 600;">
              <ion-icon :icon="downloadOutline"></ion-icon> Download JSONL Template
            </a>
          </div>

          <div class="upload-zone">
            <input type="file" ref="fileInput" accept=".jsonl" @change="handleFileUpload" id="file-upload" class="hidden-input"/>
            <label for="file-upload" class="upload-label">
              <ion-icon :icon="cloudUploadOutline" class="upload-icon"></ion-icon>
              <span>Click to Upload .jsonl</span>
            </label>
          </div>

          <div class="or-divider" style="text-align: center; margin: 24px 0; color: #64748b; position: relative;">OR</div>

          <button @click="loadDefaultDataset" class="gradient-btn" style="width: 100%">
            Load Default HotWax Dataset
          </button>
          <p style="text-align: center; font-size: 12px; color: #a0a0b0; margin-top: 8px;">
            This dataset contains 130 complete product families (with variants) and takes roughly 2-3 minutes to fully process via Shopify's Staged Uploads API.
          </p>
        </div>
        
        <!-- Post-Completion Links -->
        <div v-if="uploadStatus === 'COMPLETED' || uploadStatus === 'ERROR'" class="success-actions" style="margin-top: 24px;">
           <a v-if="resultsUrl" :href="resultsUrl" target="_blank" rel="noopener noreferrer" class="ghost-btn icon-btn" style="display: flex; justify-content: center; margin-bottom: 12px; border-color: rgba(48, 209, 88, 0.5); color: #30d158;">
            <ion-icon :icon="downloadOutline"></ion-icon> Download Results File (JSONL)
          </a>
           <a v-if="uploadStatus === 'COMPLETED'" :href="`https://admin.shopify.com/store/${storeSlug}/products`" target="_blank" rel="noopener noreferrer" class="ghost-btn icon-btn" style="display: flex; justify-content: center; margin-bottom: 12px;">
            <ion-icon :icon="openOutline"></ion-icon> View Products in Shopify Admin
          </a>
          <button @click="resetUpload" class="ghost-btn" style="width: 100%;">Start New Upload</button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonIcon } from '@ionic/vue';
import { cubeOutline, cloudUploadOutline, openOutline, downloadOutline } from 'ionicons/icons';
import { ShopifyService } from '../services/ShopifyService';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const storeSlug = computed(() => {
  return authStore.storeDomain.replace('.myshopify.com', '');
});

type UploadState = 'IDLE' | 'UPLOADING' | 'POLLING' | 'COMPLETED' | 'ERROR';
const uploadStatus = ref<UploadState>('IDLE');
const statusMessage = ref('');
const bulkError = ref('');
const currentPhaseText = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

let pollInterval: any = null;
const resultsUrl = ref('');

const uploadStateClass = computed(() => {
  if (uploadStatus.value === 'ERROR') return 'state-error';
  if (uploadStatus.value === 'COMPLETED') return 'state-success';
  return 'state-active';
});

const startBulkOrchestration = async (fileContent: string, fileName: string) => {
  uploadStatus.value = 'UPLOADING';
  bulkError.value = '';
  
  try {
    // 1. Request Target
    currentPhaseText.value = "Phase 1: Requesting Staged Target";
    statusMessage.value = "Contacting Shopify for secure cloud storage credentials...";
    
    // Calculate exact file size in bytes
    const fileBlob = new Blob([fileContent]);
    const fileSize = fileBlob.size.toString();
    
    const target = await ShopifyService.requestStagedUpload(fileName, 'text/jsonl', fileSize);
    
    // 2. Upload File to Cloud
    currentPhaseText.value = "Phase 2: Uploading Data";
    statusMessage.value = "Uploading file directly to Shopify's cloud bucket...";
    const resourceUrl = await ShopifyService.uploadFileToTarget(target, fileContent);
    
    // 3. Trigger Bulk Mutation
    currentPhaseText.value = "Phase 3: Initializing Bulk Job";
    statusMessage.value = "Telling Shopify to start processing the uploaded file...";
    
    const mutation = `mutation call($input: ProductSetInput!) { productSet(input: $input) { product { id title } userErrors { field message } } }`;
    await ShopifyService.runBulkMutation(resourceUrl, mutation);
    
    // 4. Start Polling
    uploadStatus.value = 'POLLING';
    currentPhaseText.value = "Phase 4: Processing on Shopify Servers";
    statusMessage.value = "This can take a few minutes for large catalogs. Checking status...";
    
    startPolling();

  } catch (err: any) {
    uploadStatus.value = 'ERROR';
    currentPhaseText.value = "Upload Failed";
    bulkError.value = err.message;
  }
};

const startPolling = () => {
  if (pollInterval) clearInterval(pollInterval);
  
  pollInterval = setInterval(async () => {
    try {
      const op = await ShopifyService.pollBulkOperationStatus();
      if (!op) return;

      if (op.status === 'COMPLETED') {
        clearInterval(pollInterval);
        uploadStatus.value = 'COMPLETED';
        currentPhaseText.value = "Job Completed!";
        statusMessage.value = `Successfully processed ${op.objectCount || 0} objects.`;
        if (op.url) resultsUrl.value = op.url;
      } else if (op.status === 'FAILED' || op.status === 'CANCELED') {
        clearInterval(pollInterval);
        uploadStatus.value = 'ERROR';
        currentPhaseText.value = `Job ${op.status}`;
        bulkError.value = `Shopify error code: ${op.errorCode}`;
        if (op.url) resultsUrl.value = op.url;
      } else {
        // RUNNING
        statusMessage.value = `Processing... (Objects processed: ${op.objectCount || 0})`;
      }
    } catch (err) {
      // Don't kill polling on a single network blip
      console.warn("Polling error:", err);
    }
  }, 3000);
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    startBulkOrchestration(content, file.name);
  };
  reader.readAsText(file);
};

const loadDefaultDataset = async () => {
  uploadStatus.value = 'UPLOADING';
  statusMessage.value = "Fetching default dataset...";
  try {
    const response = await fetch('/templates/default-products.jsonl');
    if (!response.ok) throw new Error("Could not load default template.");
    const content = await response.text();
    startBulkOrchestration(content, 'default-products.jsonl');
  } catch (err: any) {
    uploadStatus.value = 'ERROR';
    bulkError.value = err.message;
  }
};

const resetUpload = () => {
  uploadStatus.value = 'IDLE';
  if (fileInput.value) fileInput.value.value = '';
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

.description {
  color: #a0a0b0;
  font-size: 15px;
  margin-bottom: 24px;
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

.hidden-input {
  display: none;
}

.upload-zone {
  margin-bottom: 20px;
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
  border-color: #818cf8;
  background: rgba(99, 102, 241, 0.1);
}

.upload-icon {
  font-size: 48px;
  color: #818cf8;
  margin-bottom: 12px;
}

.divider {
  text-align: center;
  margin: 24px 0;
  color: #64748b;
  position: relative;
}

.divider::before, .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.status-tracker {
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid transparent;
}

.state-active {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.state-success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.state-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.status-tracker h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.status-tracker p {
  margin: 0;
  color: #cbd5e1;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 16px;
  overflow: hidden;
  position: relative;
}

.progress-fill.indeterminate {
  position: absolute;
  height: 100%;
  background: #818cf8;
  width: 50%;
  animation: slide 1.5s infinite linear;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
