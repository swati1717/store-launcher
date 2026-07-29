<template>
  <ion-page>
    <ion-split-pane content-id="main-content">
      
      <!-- Sidebar Menu -->
      <ion-menu content-id="main-content" type="overlay">
        <ion-header>
          <ion-toolbar class="menu-toolbar">
            <ion-title>
              <div class="brand">
                <ion-icon :icon="rocketOutline" class="brand-icon"></ion-icon>
                <span>Store Launcher</span>
              </div>
            </ion-title>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="menu-content">
          <div class="store-info" v-if="authStore.storeDomain">
            <ion-icon :icon="storefrontOutline"></ion-icon>
            <p>{{ authStore.storeDomain }}</p>
          </div>

          <ion-list lines="none" class="nav-list">
            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item 
                button
                @click="navigate(p.url, i)" 
                class="nav-item" 
                :class="{ selected: selectedIndex === i }"
                :detail="false"
              >
                <ion-icon slot="start" :icon="p.icon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>

        <ion-footer class="menu-footer">
          <ion-item button lines="none" @click="handleLogout" class="logout-item">
            <ion-icon slot="start" :icon="logOutOutline" color="danger"></ion-icon>
            <ion-label color="danger">Disconnect Store</ion-label>
          </ion-item>
        </ion-footer>
      </ion-menu>

      <!-- Main Router Outlet -->
      <ion-router-outlet id="main-content"></ion-router-outlet>
      
    </ion-split-pane>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonContent, IonPage, IonSplitPane, IonMenu, IonHeader, IonToolbar, 
  IonTitle, IonList, IonItem, IonIcon, IonLabel, IonMenuToggle, 
  IonFooter, IonRouterOutlet 
} from '@ionic/vue';
import { 
  rocketOutline, storefrontOutline, locationOutline, 
  cubeOutline, layersOutline, settingsOutline, receiptOutline, logOutOutline, flashOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const selectedIndex = ref(0);

const appPages = [
  { title: 'Quick Start', url: '/dashboard/quickstart', icon: flashOutline },
  { title: 'Configuration', url: '/dashboard/config', icon: settingsOutline },
  { title: 'Locations', url: '/dashboard/locations', icon: locationOutline },
  { title: 'Products', url: '/dashboard/products', icon: cubeOutline },
  { title: 'Inventory', url: '/dashboard/inventory', icon: layersOutline },
  { title: 'Orders', url: '/dashboard/orders', icon: receiptOutline }
];

onMounted(() => {
  // Set selected index based on current route
  const path = route.path;
  const index = appPages.findIndex(p => path.includes(p.url));
  if (index !== -1) {
    selectedIndex.value = index;
  }
});

const navigate = (url: string, index: number) => {
  selectedIndex.value = index;
  router.push(url);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/connect');
};
</script>

<style scoped>
.menu-toolbar {
  --background: #1e1e2d;
  color: white;
  padding: 8px 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.brand-icon {
  color: #00f2fe;
  font-size: 24px;
}

.menu-content {
  --background: #151521;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  color: #a0a0b0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 16px;
}

.store-info ion-icon {
  font-size: 20px;
  color: #667eea;
}

.nav-list {
  background: transparent;
  padding: 0 12px;
}

.nav-item {
  --background: transparent;
  --color: #a0a0b0;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item ion-icon {
  color: #808090;
}

.nav-item:hover {
  --background: rgba(255, 255, 255, 0.05);
  --color: white;
}

.nav-item.selected {
  --background: rgba(102, 126, 234, 0.15);
  --color: #667eea;
}

.nav-item.selected ion-icon {
  color: #667eea;
}

.menu-footer {
  background: #151521;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.logout-item {
  --background: transparent;
  margin: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
}

.logout-item:hover {
  --background: rgba(255, 59, 48, 0.1);
}
</style>
