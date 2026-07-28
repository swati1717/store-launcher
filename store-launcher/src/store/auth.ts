import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    storeDomain: localStorage.getItem('storeDomain') || '',
    apiToken: localStorage.getItem('apiToken') || '',
    isAuthenticated: !!localStorage.getItem('apiToken'),
  }),
  actions: {
    async connectStore(urlInput: string, token: string): Promise<boolean> {
      let domain = urlInput.trim();
      
      const adminMatch = domain.match(/admin\.shopify\.com\/store\/([^/?#]+)/i);
      if (adminMatch) {
        domain = `${adminMatch[1]}.myshopify.com`;
      } 
      else if (!domain.includes('.') && domain.length > 0) {
        domain = `${domain}.myshopify.com`;
      }
      else {
        domain = domain.replace(/^https?:\/\//i, '').split('/')[0];
      }

      // Check if it looks like a valid myshopify domain now
      if (!domain.endsWith('.myshopify.com')) {
        throw new Error('Your store name is incorrect. Check store name.');
      }

      try {
        // Test connection with a lightweight GraphQL query, routed through the Vite proxy to bypass browser CORS
        const response = await fetch(`/shopify-api/admin/api/2024-07/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
            'X-Shopify-Domain': domain
          },
          body: JSON.stringify({
            query: `{ shop { name } }`
          })
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        if (data.errors) {
          return false;
        }

        // If successful, update state
        this.storeDomain = domain;
        this.apiToken = token;
        this.isAuthenticated = true;

        localStorage.setItem('storeDomain', domain);
        localStorage.setItem('apiToken', token);
        
        return true;
      } catch (error) {
        console.error('Shopify Connection Error:', error);
        throw new Error('Connection failed. Please check your network or try again.');
      }
    },
    logout() {
      this.storeDomain = '';
      this.apiToken = '';
      this.isAuthenticated = false;
      localStorage.removeItem('storeDomain');
      localStorage.removeItem('apiToken');
    }
  }
});
