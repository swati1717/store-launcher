<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="header-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Order Scenarios Setup</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding content-area">
      <div class="content-wrapper">
        <div class="header-section">
          <h2>Shopify Order Testing</h2>
          <p>Generate precise order flows to test OMS scenarios.</p>
        </div>

      <!-- Unauthenticated State -->
      <ion-card class="status-card" v-if="!authStore.isAuthenticated">
        <ion-card-content class="error-state">
          <ion-icon :icon="warningOutline" color="warning" class="status-icon"></ion-icon>
          <div>
            <h3>Not Connected</h3>
            <p>Please connect your Shopify store first to load products and customers.</p>
            <ion-button router-link="/connect" size="small" class="ion-margin-top">Connect Store</ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Loading State -->
      <ion-card class="status-card" v-else-if="isLoadingData">
        <ion-card-content class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Fetching active products and customers from Shopify...</p>
        </ion-card-content>
      </ion-card>

      <!-- Success State -->
      <ion-card class="status-card" v-else-if="poolReady">
        <ion-card-content class="success-state">
          <ion-icon :icon="checkmarkCircle" color="success" class="status-icon"></ion-icon>
          <div>
            <h3>Data Pool Ready</h3>
            <p>Loaded {{ availableProducts.length }} products and default {{ availableCustomers.length }} customers we can use for testing.</p>
          </div>
        </ion-card-content>
      </ion-card>

      <div class="form-container" v-if="poolReady && authStore.isAuthenticated">
        <ion-list class="config-list">
          <ion-list-header>
            <ion-label>Scenario Configuration</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-select label="Order Scenario" label-placement="stacked" v-model="selectedScenario" interface="popover">
              <ion-select-option v-for="(scenario, index) in scenariosList" :key="index" :value="scenario.id">
                {{ scenario.id }}. {{ scenario.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-input 
              label="Number of Orders to Create" 
              label-placement="stacked"
              type="number" 
              v-model.number="orderCount"
              min="1" 
              max="50">
            </ion-input>
          </ion-item>

          <ion-item v-if="requiresMultipleItems">
            <ion-input 
              label="Number of Items" 
              label-placement="stacked"
              type="number" 
              v-model.number="numberOfItems"
              min="2" 
              max="10">
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-toggle v-model="useSameCustomer" justify="space-between">
              Use Same Customer for Batch
            </ion-toggle>
          </ion-item>

          <ion-item v-if="requiresMultipleItems">
            <ion-toggle v-model="useSameProduct" justify="space-between">
              Use Same Product (Different Quantities)
            </ion-toggle>
          </ion-item>
        </ion-list>

        <div class="action-container">
          <ion-button expand="block" class="run-btn" @click="runScenario('SINGLE')" :disabled="isRunning">
            <ion-spinner v-if="isRunning" name="crescent" class="ion-margin-end"></ion-spinner>
            {{ isRunning ? 'Creating Order...' : 'Run Selected Scenario' }}
          </ion-button>

          <ion-button expand="block" color="secondary" class="run-btn ion-margin-top" @click="runScenario('ALL')" :disabled="isRunning">
            <ion-icon :icon="flashOutline" slot="start" v-if="!isRunning"></ion-icon>
            Run All Scenarios in Bulk
          </ion-button>
        </div>
      </div>

      <!-- Logs Section -->
      <div class="logs-container" v-if="logs.length > 0">
        <h3>Execution Logs</h3>
        <ion-card v-for="(log, i) in logs" :key="i" class="log-card" :class="log.type">
          <ion-card-content>
            <div class="log-header">
              <span class="log-time">{{ log.time }}</span>
              <ion-badge :color="log.type === 'success' ? 'success' : (log.type === 'error' ? 'danger' : 'medium')">
                {{ log.type.toUpperCase() }}
              </ion-badge>
            </div>
            <p class="log-message">{{ log.message }}</p>
            <a v-if="log.link" :href="log.link" target="_blank" class="log-link">View in Shopify &rarr;</a>
          </ion-card-content>
        </ion-card>
      </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonMenuButton, IonCard, IonCardContent, IonSpinner, IonIcon, IonList,
  IonListHeader, IonItem, IonLabel, IonSelect, IonSelectOption, IonInput,
  IonToggle, IonButton, IonBadge, alertController
} from '@ionic/vue';
import { checkmarkCircle, warningOutline, flashOutline } from 'ionicons/icons';
import { ShopifyService } from '../services/ShopifyService';
import { useAuthStore } from '../store/auth';

const authStore = useAuthStore();

// --- STATE ---
const isLoadingData = ref(true);
const poolReady = ref(false);
const availableProducts = ref<any[]>([]);
const availableCustomers = ref<any[]>([]);
const availableLocations = ref<any[]>([]);

const selectedScenario = ref<number | string>(1);
const orderCount = ref(1);
const numberOfItems = ref(2);
const useSameCustomer = ref(true);
const useSameProduct = ref(false);

const isRunning = ref(false);
const logs = ref<any[]>([]);

// --- SCENARIOS LIST ---
const scenariosList = [
  { id: 1, name: "Web Standard Order – Single Product", multi: false },
  { id: 2, name: "Web BOPIS Order – Single Product", multi: false },
  { id: 3, name: "Web Multiple Item Order – Multiple Products", multi: true },
  { id: 4, name: "Web Mixed Cart Order – Multiple Products (BOPIS + Standard)", multi: true },
  { id: 5, name: "Web Order – No Adjustments", multi: false },
  { id: 6, name: "Web Order – Shipping, Discount & Taxes", multi: false },
  { id: 7, name: "Web Order – Unfulfilled Discount", multi: false },
  { id: 8, name: "Web Order – Items with Mixed Status", multi: true },
  { id: 20, name: "Web Fulfilled Return – Restock", multi: false }
];

const requiresMultipleItems = computed(() => {
  const scenario = scenariosList.find(s => s.id === selectedScenario.value);
  return scenario ? scenario.multi : false;
});

// --- INIT ---
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    isLoadingData.value = false;
    return;
  }
  
  try {
    const [prods, locs] = await Promise.all([
      ShopifyService.fetchTestProducts(10),
      ShopifyService.getLocations()
    ]);
    availableProducts.value = prods;
    availableLocations.value = locs;
  } catch (e: any) {
    addLog('error', `Failed to load products/locations: ${e.message}`);
  }

  // Load custom testing customers derived from the user's CSV
  try {
    const response = await fetch('/data/customers.json');
    if (response.ok) {
      availableCustomers.value = await response.json();
    } else {
      addLog('error', 'Could not load customers.json from public directory.');
    }
  } catch (e: any) {
    addLog('error', `Customer data fetch failed: ${e.message}`);
  }

  poolReady.value = true;
  isLoadingData.value = false;
});

// --- LOGIC ---
const addLog = (type: 'info'|'success'|'error', message: string, link?: string) => {
  logs.value.unshift({
    type,
    message,
    link,
    time: new Date().toLocaleTimeString()
  });
};

const runScenario = async (mode: 'SINGLE' | 'ALL' = 'SINGLE') => {
  if (!poolReady.value || availableProducts.value.length === 0) {
    addLog('error', 'Cannot run scenario: No products available in store.');
    return;
  }

  if (mode === 'ALL') {
    const totalOrders = scenariosList.length * orderCount.value;
    const alert = await alertController.create({
      header: 'Confirm Bulk Generation',
      message: `You are about to create <strong>${totalOrders} orders</strong> in bulk.<br><br>
      • <strong>2 products</strong> will be assigned by default to multi-item scenarios.<br>
      • <strong>5 different customers</strong> will be rotated automatically.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Proceed', handler: () => executeScenarioEngine(mode) }
      ]
    });
    await alert.present();
  } else {
    executeScenarioEngine(mode);
  }
};

const executeScenarioEngine = async (mode: 'SINGLE' | 'ALL') => {
  isRunning.value = true;
  if (mode === 'ALL') {
    addLog('info', `Initializing Bulk Run for ALL Scenarios (${orderCount.value} orders each)...`);
  }

  try {
    let scenariosToRun = mode === 'ALL'
      ? scenariosList
      : [scenariosList.find(s => s.id === selectedScenario.value)];

    let globalCounter = 0;

    for (let s = 0; s < scenariosToRun.length; s++) {
      const currentScenario: any = scenariosToRun[s];
      if (!currentScenario) continue;

      for (let o = 0; o < orderCount.value; o++) {
        // Pick customer: strict 5 customers cycle for 'ALL', otherwise follow existing rules
        let customer;
        if (mode === 'ALL') {
          customer = availableCustomers.value[globalCounter % 5];
        } else {
          customer = useSameCustomer.value 
            ? availableCustomers.value[0] 
            : availableCustomers.value[o % availableCustomers.value.length];
        }
        
        let lineItems = [];
        let itemsCount = currentScenario.multi ? (mode === 'ALL' ? 2 : numberOfItems.value) : 1;
        
        // Pick products
        for (let i = 0; i < itemsCount; i++) {
          const product = useSameProduct.value ? availableProducts.value[0] : availableProducts.value[i % availableProducts.value.length];
          let item: any = {
            variant_id: product.id.split('/').pop(),
            quantity: 1
          };

          // Scenario specific logic
          if (currentScenario.id === 2) {
            const pickupFacility = availableLocations.value.length > 0 ? availableLocations.value[0].name : "Broadway";
            item.properties = [{ name: "_pickupstore", value: pickupFacility }]; // Assigned dynamically
          } else if (currentScenario.id === 4) {
            if (i % 2 === 0) {
              const pickupFacility = availableLocations.value.length > 0 ? availableLocations.value[0].name : "Broadway";
              item.properties = [{ name: "_pickupstore", value: pickupFacility }];
            }
          }

          lineItems.push(item);
        }

        const payload: any = {
          line_items: lineItems,
          tags: "automation-agent-test",
          financial_status: "paid"
        };

        // Add Sales Tax and Discounts for scenarios 6 and 7
        if (currentScenario.id === 6 || currentScenario.id === 7) {
          payload.tax_lines = [{ price: "15.00", rate: 0.08, title: "State Sales Tax" }];
          payload.discount_codes = [{ code: "PROMO10", amount: "10.00", type: "fixed_amount" }];
          if (currentScenario.id === 6) {
            payload.shipping_lines = [{ title: "Standard Shipping", price: "5.00", code: "Standard" }];
          }
        }
        
        if (customer) {
          if (customer.id && !customer.isFallback) {
            payload.customer = { id: customer.id.split('/').pop() };
          }
          payload.email = customer.email;
          
          if (customer.defaultAddress) {
            const address = {
              first_name: customer.firstName || customer.defaultAddress.firstName,
              last_name: customer.lastName || customer.defaultAddress.lastName,
              address1: customer.defaultAddress.address1,
              city: customer.defaultAddress.city,
              province_code: customer.defaultAddress.provinceCode,
              country_code: customer.defaultAddress.countryCode,
              zip: customer.defaultAddress.zip
            };
            payload.billing_address = address;
            payload.shipping_address = address;
          }
        }

        if (customer) {
          addLog('info', `Order ${globalCounter + 1} (Scenario ${currentScenario.id}): Assigned to ${customer.firstName} ${customer.lastName}`);
        } else {
          addLog('info', `Creating Order ${globalCounter + 1} (Scenario ${currentScenario.id})...`);
        }
        
        const createdOrder = await ShopifyService.createOrder(payload);
        
        if (createdOrder) {
          const orderLink = `https://admin.shopify.com/store/${authStore.storeDomain.split('.')[0]}/orders/${createdOrder.id}`;
          addLog('success', `Scenario ${currentScenario.id} Complete! ID: ${createdOrder.name}`, orderLink);
        } else {
          addLog('error', `Failed to create Order for Scenario ${currentScenario.id}.`);
        }

        globalCounter++;
      }
    }
  } catch (error: any) {
    addLog('error', `Scenario execution failed: ${error.message}`);
  } finally {
    isRunning.value = false;
  }
};
</script>

<style scoped>
.header-toolbar {
  --background: #151521;
  color: white;
}

/* Solid Background */
.content-area {
  --background: #0f0f1a;
}

.content-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 0;
}

.header-section {
  margin-bottom: 32px;
  text-align: center;
}
.header-section h2 {
  font-weight: 800;
  font-size: 28px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #fff, #a0a0b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.header-section p {
  color: #8c8d9e;
  font-size: 15px;
  margin: 0;
}

/* Glassmorphism Cards */
.status-card {
  background: rgba(30, 30, 40, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin-bottom: 32px;
  transition: transform 0.2s ease;
}
.status-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
}

.loading-state, .success-state, .error-state {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.success-state h3, .error-state h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}
.success-state p, .error-state p {
  margin: 0;
  font-size: 14px;
  color: #8c8d9e;
}
.status-icon {
  font-size: 36px;
}

/* Form Container */
.form-container {
  background: rgba(20, 21, 31, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.config-list {
  background: transparent;
}

.config-list ion-item {
  --background: transparent;
  --border-color: rgba(255, 255, 255, 0.05);
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
  --color: #e2e2ea;
  color: #e2e2ea;
}

/* Force light color on inputs and labels */
ion-select, ion-input, ion-toggle, ion-label {
  color: #ffffff !important;
}

ion-select::part(text) {
  color: #ffffff;
}

ion-select::part(icon) {
  color: #a0a0b0;
}

.config-list ion-list-header {
  --background: transparent;
  padding-left: 0;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 15px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.action-container {
  margin-top: 32px;
}

.run-btn {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --background-hover: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  --border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  height: 54px;
  text-transform: none;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}
.run-btn:active {
  transform: scale(0.98);
}

/* Logs */
.logs-container {
  margin-top: 48px;
}
.logs-container h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #fff;
}

.log-card {
  margin: 0 0 16px 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid #a0a0b0;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}
.log-card.info {
  border-left-color: #3880ff;
}
.log-card.success {
  border-left-color: #2dd36f;
  background: rgba(45, 211, 111, 0.05);
}
.log-card.error {
  border-left-color: #eb445a;
  background: rgba(235, 68, 90, 0.05);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.log-time {
  font-size: 12px;
  color: #8c8d9e;
  font-weight: 500;
}
.log-message {
  color: #e2e2ea;
  margin: 0 0 12px 0;
  font-size: 15px;
  line-height: 1.5;
}
.log-link {
  display: inline-block;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  background: rgba(102, 126, 234, 0.1);
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s ease;
}
.log-link:hover {
  background: rgba(102, 126, 234, 0.2);
}
</style>
