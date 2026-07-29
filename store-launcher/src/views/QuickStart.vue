<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>1-Click Setup</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding content-area">
      <div class="card">
        <div class="card-header" style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div class="icon-wrapper" style="background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%); color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(251, 194, 235, 0.4);">
            <ion-icon :icon="flashOutline"></ion-icon>
          </div>
          <h3 style="margin: 0; font-size: 1.5rem; font-weight: 600;">Automated Initialization</h3>
        </div>
        
        <p class="description">
          Import all HotWax default data with a single click. This process provisions your store with the required metafields, locations, product catalog, and initial inventory levels sequentially.
        </p>
        
        <div style="background: rgba(255, 204, 0, 0.1); border-left: 4px solid #ffcc00; padding: 12px; border-radius: 4px; margin-bottom: 24px; margin-top: 16px;">
          <p style="margin: 0; font-size: 14px; color: #ffcc00; display: flex; align-items: center; gap: 8px;">
            <ion-icon :icon="warningOutline"></ion-icon>
            <strong>Note:</strong> You will still need to add your store configurations manually via the Configuration tab.
          </p>
        </div>

        <div v-if="!isStarted && !isCompleted" class="upload-controls" style="margin-top: 32px;">
          <h4 style="margin-bottom: 12px; font-size: 16px;">Select steps to run:</h4>
          <div class="checkbox-group" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" v-model="selectedSteps.metafields" style="width: 18px; height: 18px; accent-color: #667eea;"> Metafields
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" v-model="selectedSteps.locations" style="width: 18px; height: 18px; accent-color: #667eea;"> Locations
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" v-model="selectedSteps.products" style="width: 18px; height: 18px; accent-color: #667eea;"> Products
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" v-model="selectedSteps.inventory" style="width: 18px; height: 18px; accent-color: #667eea;"> Inventory
            </label>
          </div>

          <button @click="startOrchestration" class="gradient-btn" style="width: 100%; font-size: 18px; padding: 16px;">
            Start 1-Click Setup
          </button>
          <p style="text-align: center; font-size: 13px; color: #a0a0b0; margin-top: 12px;">
            This process takes approximately 5-6 minutes. Please do not close this tab until completed.
          </p>
        </div>

        <div v-if="isStarted || isCompleted" class="stepper-container">
          
          <!-- Step 1: Metafields -->
          <div class="step-item" :class="getStepClass('metafields')">
            <div class="step-indicator">
              <ion-icon v-if="steps.metafields.status === 'DONE'" :icon="checkmarkCircle"></ion-icon>
              <ion-icon v-else-if="steps.metafields.status === 'SKIPPED'" :icon="playSkipForwardOutline"></ion-icon>
              <ion-spinner v-else-if="steps.metafields.status === 'PROCESSING'" name="crescent"></ion-spinner>
              <div v-else class="step-circle">1</div>
            </div>
            <div class="step-content">
              <h4>Metafields</h4>
              <p>{{ steps.metafields.message }}</p>
            </div>
          </div>

          <!-- Step 2: Locations -->
          <div class="step-item" :class="getStepClass('locations')">
            <div class="step-indicator">
              <ion-icon v-if="steps.locations.status === 'DONE'" :icon="checkmarkCircle"></ion-icon>
              <ion-icon v-else-if="steps.locations.status === 'SKIPPED'" :icon="playSkipForwardOutline"></ion-icon>
              <ion-spinner v-else-if="steps.locations.status === 'PROCESSING'" name="crescent"></ion-spinner>
              <div v-else class="step-circle">2</div>
            </div>
            <div class="step-content">
              <h4>Locations</h4>
              <p>{{ steps.locations.message }}</p>
            </div>
          </div>

          <!-- Step 3: Products -->
          <div class="step-item" :class="getStepClass('products')">
            <div class="step-indicator">
              <ion-icon v-if="steps.products.status === 'DONE'" :icon="checkmarkCircle"></ion-icon>
              <ion-icon v-else-if="steps.products.status === 'SKIPPED'" :icon="playSkipForwardOutline"></ion-icon>
              <ion-spinner v-else-if="steps.products.status === 'PROCESSING'" name="crescent"></ion-spinner>
              <div v-else class="step-circle">3</div>
            </div>
            <div class="step-content">
              <h4>Products</h4>
              <p>{{ steps.products.message }}</p>
              <div v-if="steps.products.status === 'PROCESSING'" class="progress-bar mini-progress">
                <div class="progress-fill indeterminate"></div>
              </div>
            </div>
          </div>

          <!-- Step 4: Inventory -->
          <div class="step-item" :class="getStepClass('inventory')">
            <div class="step-indicator">
              <ion-icon v-if="steps.inventory.status === 'DONE'" :icon="checkmarkCircle"></ion-icon>
              <ion-icon v-else-if="steps.inventory.status === 'SKIPPED'" :icon="playSkipForwardOutline"></ion-icon>
              <ion-spinner v-else-if="steps.inventory.status === 'PROCESSING'" name="crescent"></ion-spinner>
              <div v-else class="step-circle">4</div>
            </div>
            <div class="step-content">
              <h4>Inventory</h4>
              <p>{{ steps.inventory.message }}</p>
              <div v-if="steps.inventory.status === 'PROCESSING'" class="progress-bar mini-progress">
                <div class="progress-fill indeterminate"></div>
              </div>
            </div>
          </div>

        </div>

        <div v-if="isPaused" class="error-banner" style="margin-top: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #ff9f9a;">Error encountered!</h4>
          <p style="margin: 0 0 16px 0;">{{ globalError }}</p>
          <div style="display: flex; gap: 12px;">
            <button @click="skipAndContinue" class="ghost-btn" style="border-color: #ff9f9a; color: #ff9f9a; font-size: 14px; padding: 10px 16px;">Skip Step & Continue</button>
            <button @click="abortSetup" class="ghost-btn" style="font-size: 14px; padding: 10px 16px;">Abort Setup</button>
          </div>
        </div>
        <div v-else-if="hasError && !isPaused" class="error-banner" style="margin-top: 24px;">
          {{ globalError }}
        </div>

        <!-- Completion Actions -->
        <div v-if="isCompleted && !hasError" class="success-actions" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <ion-icon :icon="checkmarkCircle" style="font-size: 48px; color: #30d158;"></ion-icon>
            <h2 style="margin: 8px 0 0 0; color: white;">Setup Finished!</h2>
            <p style="color: #a0a0b0; font-size: 14px; margin-top: 4px;">Selected data has been provisioned.</p>
          </div>
          
          <a :href="`https://admin.shopify.com/store/${storeSlug}`" target="_blank" rel="noopener noreferrer" class="gradient-btn" style="display: flex; justify-content: center; text-decoration: none;">
            <ion-icon :icon="openOutline" style="margin-right: 8px;"></ion-icon> Open Shopify Admin
          </a>
        </div>
        
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton, IonIcon, IonSpinner 
} from '@ionic/vue';
import { flashOutline, checkmarkCircle, openOutline, playSkipForwardOutline, warningOutline } from 'ionicons/icons';
import { ref, reactive, computed } from 'vue';
import { ShopifyService } from '../services/ShopifyService';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();
const storeSlug = computed(() => {
  return authStore.storeDomain.replace('.myshopify.com', '');
});

const isStarted = ref(false);
const isCompleted = ref(false);
const hasError = ref(false);
const isPaused = ref(false);
const globalError = ref('');

const selectedSteps = reactive({
  metafields: true,
  locations: true,
  products: true,
  inventory: true,
});

type StepStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR' | 'SKIPPED';

interface StepState {
  status: StepStatus;
  message: string;
}

const steps = reactive({
  metafields: { status: 'PENDING', message: 'Waiting to start...' } as StepState,
  locations: { status: 'PENDING', message: 'Waiting to start...' } as StepState,
  products: { status: 'PENDING', message: 'Waiting to start...' } as StepState,
  inventory: { status: 'PENDING', message: 'Waiting to start...' } as StepState,
});

const getStepClass = (key: keyof typeof steps) => {
  const status = steps[key].status;
  return {
    'step-pending': status === 'PENDING',
    'step-processing': status === 'PROCESSING',
    'step-done': status === 'DONE',
    'step-skipped': status === 'SKIPPED',
    'step-error': status === 'ERROR',
  };
};

let stepQueue: Array<keyof typeof steps> = [];
let currentStepIndex = 0;

const startOrchestration = async () => {
  isStarted.value = true;
  isCompleted.value = false;
  hasError.value = false;
  isPaused.value = false;
  globalError.value = '';

  // Initialize queue and statuses
  stepQueue = [];
  const allKeys: Array<keyof typeof steps> = ['metafields', 'locations', 'products', 'inventory'];
  
  allKeys.forEach(key => {
    if (selectedSteps[key]) {
      stepQueue.push(key);
      steps[key].status = 'PENDING';
      steps[key].message = 'Waiting to start...';
    } else {
      steps[key].status = 'SKIPPED';
      steps[key].message = 'Skipped by user.';
    }
  });

  currentStepIndex = 0;
  runNextStep();
};

const runNextStep = async () => {
  if (currentStepIndex >= stepQueue.length) {
    isCompleted.value = true;
    return;
  }
  
  const stepKey = stepQueue[currentStepIndex];
  try {
    if (stepKey === 'metafields') await processMetafields();
    else if (stepKey === 'locations') await processLocations();
    else if (stepKey === 'products') await processProducts();
    else if (stepKey === 'inventory') await processInventory();
    
    currentStepIndex++;
    runNextStep();
  } catch (err: any) {
    hasError.value = true;
    isPaused.value = true;
    globalError.value = err.message;
  }
};

const skipAndContinue = () => {
  const stepKey = stepQueue[currentStepIndex];
  steps[stepKey].status = 'SKIPPED';
  steps[stepKey].message = `Skipped due to error: ${globalError.value}`;
  
  hasError.value = false;
  isPaused.value = false;
  globalError.value = '';
  
  currentStepIndex++;
  runNextStep();
};

const abortSetup = () => {
  isPaused.value = false;
  globalError.value = 'Setup aborted by user after encountering an error.';
};

// ---------------------------------------------------------------------------
// 1. Metafields
// ---------------------------------------------------------------------------
const processMetafields = async () => {
  steps.metafields.status = 'PROCESSING';
  steps.metafields.message = 'Loading HC_PREORDER metafield definition...';
  
  try {
    const mf = {
      name: 'HC_PREORDER',
      namespace: 'custom',
      key: 'hc_preorder',
      type: 'json',
      description: 'Stores preorder configuration',
      ownerType: 'PRODUCTVARIANT'
    };
    await ShopifyService.createProductMetafieldDefinition(mf);
    steps.metafields.status = 'DONE';
    steps.metafields.message = 'Metafields configured successfully.';
  } catch (e: any) {
    console.warn("Metafield creation issue (might already exist):", e.message);
    steps.metafields.status = 'DONE';
    steps.metafields.message = 'Metafields configured (or already existed).';
  }
};

// ---------------------------------------------------------------------------
// 2. Locations
// ---------------------------------------------------------------------------
const processLocations = async () => {
  steps.locations.status = 'PROCESSING';
  steps.locations.message = 'Fetching default locations template...';
  
  try {
    const res = await fetch('/templates/default-locations.json');
    if (!res.ok) throw new Error("Could not load default locations template.");
    const locations = await res.json();
    
    for (let i = 0; i < locations.length; i++) {
      steps.locations.message = `Creating location ${i + 1} of ${locations.length}...`;
      await ShopifyService.addLocation(locations[i]);
    }
    
    steps.locations.status = 'DONE';
    steps.locations.message = `Successfully imported ${locations.length} locations.`;
  } catch (e: any) {
    steps.locations.status = 'ERROR';
    steps.locations.message = `Location error: ${e.message}`;
    throw e;
  }
};

// ---------------------------------------------------------------------------
// 3. Products
// ---------------------------------------------------------------------------
const processProducts = async () => {
  steps.products.status = 'PROCESSING';
  steps.products.message = 'Fetching default products template...';
  
  try {
    const response = await fetch('/templates/default-products.jsonl');
    if (!response.ok) throw new Error("Could not load default products template.");
    let content = await response.text();
    
    steps.products.message = 'Activating location mapping...';
    const activeLocations = await ShopifyService.getLocations();
    if (activeLocations.length > 0) {
      const primaryLocationId = activeLocations[0].id;
      const lines = content.split('\n').filter(l => l.trim() !== '');
      const mappedLines = lines.map(line => {
         try {
           const p = JSON.parse(line).input;
           if (p.variants) {
             p.variants = p.variants.map((v: any) => ({
               ...v,
               inventoryQuantities: v.inventoryQuantities || [{ locationId: primaryLocationId, name: 'available', quantity: 0 }]
             }));
           }
           return JSON.stringify({ input: p });
         } catch { return line; }
      });
      content = mappedLines.join('\n');
    }

    steps.products.message = 'Uploading file to Shopify Cloud...';
    const target = await ShopifyService.requestStagedUpload('products.jsonl', 'text/jsonl', new Blob([content]).size.toString());
    const resourceUrl = await ShopifyService.uploadFileToTarget(target, content);
    
    steps.products.message = 'Starting Bulk Operation...';
    const mutation = `mutation call($input: ProductSetInput!) { productSet(input: $input) { product { id title } userErrors { field message } } }`;
    await ShopifyService.runBulkMutation(resourceUrl, mutation);
    
    steps.products.message = 'Processing on Shopify Servers (this takes a few minutes)...';
    
    await waitForBulkOperationToComplete((op) => {
      steps.products.message = `Processing objects: ${op.objectCount || 0}...`;
    });
    
    steps.products.status = 'DONE';
    steps.products.message = 'Product catalog imported successfully.';
  } catch (e: any) {
    steps.products.status = 'ERROR';
    steps.products.message = `Product error: ${e.message}`;
    throw e;
  }
};

// ---------------------------------------------------------------------------
// 4. Inventory
// ---------------------------------------------------------------------------
const processInventory = async () => {
  steps.inventory.status = 'PROCESSING';
  steps.inventory.message = 'Fetching default inventory template...';
  
  try {
    const response = await fetch('/templates/default-products.jsonl');
    if (!response.ok) throw new Error("Could not load template.");
    const content = await response.text();
    
    steps.inventory.message = 'Fetching active locations...';
    const locations = await ShopifyService.getLocations();
    if (locations.length === 0) throw new Error("No active locations found.");
    const primaryLocationId = locations[0].id;
    
    steps.inventory.message = 'Mapping Variant SKUs to Product IDs (bypassing search delays)...';
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const handlesToFetch = new Set<string>();
    
    lines.forEach(line => {
      try {
        const p = JSON.parse(line).input;
        if (p.handle) handlesToFetch.add(p.handle);
      } catch (e) {}
    });

    const handleToIdMap = await ShopifyService.getProductHandleToIdMap(Array.from(handlesToFetch));
    
    steps.inventory.message = 'Generating inventory payload...';
    const mappedLines = lines.map(line => {
      try {
        const p = JSON.parse(line).input;
        if (!p.handle || !handleToIdMap[p.handle]) return null;
        
        const payload: any = {
          id: handleToIdMap[p.handle],
          variants: p.variants ? p.variants.map((v: any) => ({
            sku: v.sku,
            inventoryQuantities: [{
              locationId: primaryLocationId,
              name: "available",
              quantity: 100
            }]
          })) : undefined
        };
        return JSON.stringify({ input: payload });
      } catch { return null; }
    }).filter(l => l !== null);
    
    const inventoryPayload = mappedLines.join('\n');
    
    steps.inventory.message = 'Uploading inventory file to Cloud...';
    const target = await ShopifyService.requestStagedUpload('inventory.jsonl', 'text/jsonl', new Blob([inventoryPayload]).size.toString());
    const resourceUrl = await ShopifyService.uploadFileToTarget(target, inventoryPayload);
    
    steps.inventory.message = 'Starting Bulk Operation...';
    const mutation = `mutation call($input: ProductSetInput!) { productSet(input: $input) { product { id title } userErrors { field message } } }`;
    await ShopifyService.runBulkMutation(resourceUrl, mutation);
    
    steps.inventory.message = 'Processing inventory on Shopify Servers...';
    await waitForBulkOperationToComplete((op) => {
      steps.inventory.message = `Processing inventory items: ${op.objectCount || 0}...`;
    });
    
    steps.inventory.status = 'DONE';
    steps.inventory.message = 'Inventory levels synced successfully.';
  } catch (e: any) {
    steps.inventory.status = 'ERROR';
    steps.inventory.message = `Inventory error: ${e.message}`;
    throw e;
  }
};

// ---------------------------------------------------------------------------
// Helper: Poller
// ---------------------------------------------------------------------------
const waitForBulkOperationToComplete = (onTick: (op: any) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const op = await ShopifyService.pollBulkOperationStatus();
        if (!op) return;
        
        if (op.status === 'COMPLETED') {
          clearInterval(interval);
          resolve();
        } else if (op.status === 'FAILED' || op.status === 'CANCELED') {
          clearInterval(interval);
          reject(new Error(`Shopify Bulk Job ${op.status} (Code: ${op.errorCode})`));
        } else {
          onTick(op);
        }
      } catch (err) {
        console.warn("Polling glitch:", err);
      }
    }, 3000);
  });
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
  padding: 32px;
  max-width: 600px;
  margin: 0 auto 40px auto;
  color: white;
}

.description {
  color: #a0a0b0;
  font-size: 15px;
  line-height: 1.5;
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
  transition: opacity 0.2s;
}

.gradient-btn:active {
  opacity: 0.8;
}

.ghost-btn {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Stepper */
.stepper-container {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-item {
  display: flex;
  gap: 16px;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step-pending {
  opacity: 0.5;
}

.step-processing {
  opacity: 1;
}

.step-done {
  opacity: 1;
}

.step-skipped {
  opacity: 0.8;
}

.step-done .step-indicator ion-icon {
  color: #30d158;
  font-size: 28px;
}

.step-skipped .step-indicator ion-icon {
  color: #ffcc00;
  font-size: 26px;
}

.step-error {
  opacity: 1;
}

.step-error .step-indicator .step-circle {
  border-color: #ff453a;
  color: #ff453a;
}

.step-indicator {
  width: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2px;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #a0a0b0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #a0a0b0;
}

.step-processing .step-circle {
  border-color: #667eea;
  color: #667eea;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #a0a0b0;
}

/* Mini Progress Bar */
.mini-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
  width: 100%;
}

.progress-fill.indeterminate {
  height: 100%;
  width: 50%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  animation: slide 1.5s infinite ease-in-out;
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.error-banner {
  background: rgba(255, 59, 48, 0.1);
  border-left: 4px solid #ff453a;
  color: #ff9f9a;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
