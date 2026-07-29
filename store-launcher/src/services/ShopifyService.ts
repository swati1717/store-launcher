import { useAuthStore } from '../store/auth';

export class ShopifyService {
  /**
   * Executes a generic GraphQL query against the Shopify Admin API using the Vite proxy.
   */
  static async runGraphQL(query: string, variables: any = {}) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.storeDomain || !authStore.apiToken) {
      throw new Error('Not authenticated with Shopify.');
    }

    try {
      const response = await fetch(`/shopify-api/admin/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': authStore.apiToken,
          'X-Shopify-Domain': authStore.storeDomain
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        throw new Error(`Shopify API responded with status: ${response.status}`);
      }

      const json = await response.json();

      if (json.errors) {
        throw new Error(json.errors[0]?.message || 'GraphQL Query Error');
      }

      return json.data;
    } catch (error: any) {
      console.error('Shopify GraphQL Error:', error);
      throw error;
    }
  }

  /**
   * Adds a single location to Shopify
   */
  static async addLocation(locationInput: any) {
    const mutation = `
      mutation locationAdd($input: LocationAddInput!) { 
        locationAdd(input: $input) { 
          location { id name } 
          userErrors { field message } 
        } 
      }
    `;

    const response = await this.runGraphQL(mutation, { input: locationInput });

    if (response?.locationAdd?.userErrors?.length > 0) {
      const errorMsg = response.locationAdd.userErrors[0].message;

      if (errorMsg.includes('address.countryCode')) {
        throw new Error('Invalid Country. Please use the exact 2-letter ISO country code (e.g., US, CA, GB).');
      }
      if (errorMsg.includes('address.provinceCode')) {
        throw new Error('Invalid State/Province. Please use the exact 2-letter ISO province code (e.g., NY, TX, ON).');
      }

      throw new Error(errorMsg);
    }

    return response?.locationAdd?.location;
  }

  /**
   * Executes a generic REST API request against the Shopify Admin API using the Vite proxy.
   */
  static async runREST(endpoint: string, method: string = 'GET', body: any = null) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.storeDomain || !authStore.apiToken) {
      throw new Error('Not authenticated with Shopify.');
    }

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': authStore.apiToken,
          'X-Shopify-Domain': authStore.storeDomain
        }
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      // Automatically prepend the proxy path and API version if not fully provided
      const url = endpoint.startsWith('/') ? `/shopify-api${endpoint}` : `/shopify-api/admin/api/2024-07/${endpoint}`;

      const response = await fetch(url, options);

      if (!response.ok) {
        let errorMsg = `Shopify API responded with status: ${response.status}`;
        try {
          const json = await response.json();
          if (json.errors) errorMsg = JSON.stringify(json.errors);
        } catch (e) { /* ignore */ }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Shopify REST Error:', error);
      throw error;
    }
  }

  /**
   * Adds a custom shipping Carrier Service via REST API
   */
  static async addCarrierService(name: string, callback_url: string) {
    const payload = {
      carrier_service: {
        name,
        callback_url,
        service_discovery: true
      }
    };
    const response = await this.runREST('carrier_services.json', 'POST', payload);
    return response.carrier_service;
  }

  /**
   * Fetches all products and returns a map of handle -> productId
   */
  static async getProductHandleToIdMap(handles: string[]): Promise<Record<string, string>> {
    const map: Record<string, string> = {};
    if (!handles || handles.length === 0) return map;

    // Remove duplicates
    const uniqueHandles = [...new Set(handles)];

    // Chunk into batches of 100 to avoid GraphQL cost limits (100 aliases = 100 points)
    const chunkSize = 100;

    for (let i = 0; i < uniqueHandles.length; i += chunkSize) {
      const chunk = uniqueHandles.slice(i, i + chunkSize);

      // Build a query with aliases for strict database lookup (bypasses search index lag)
      let queryStr = 'query { ';
      chunk.forEach((handle, index) => {
        // Alias must be alphanumeric
        const alias = `product_${index}`;
        queryStr += `${alias}: productByHandle(handle: "${handle}") { id title } `;
      });
      queryStr += '}';

      try {
        const data = await this.runGraphQL(queryStr);

        chunk.forEach((handle, index) => {
          const alias = `product_${index}`;
          const product = data[alias];
          if (product) {
            map[handle] = product.id;
            if (product.title) {
              map[product.title] = product.id;
            }
          }
        });
      } catch (err) {
        console.warn(`Failed to fetch ID map chunk ${i}:`, err);
      }
    }

    return map;
  }

  /**
   * Creates a Metafield Definition via GraphQL API
   */
  static async createProductMetafieldDefinition(defInput: any) {
    const mutation = `
      mutation metafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const definition: any = {
      namespace: defInput.namespace,
      key: defInput.key,
      type: defInput.type,
      name: defInput.name || `${defInput.namespace} ${defInput.key}`, // Required display name
      ownerType: defInput.ownerType || "PRODUCT"
    };

    if (defInput.description) {
      definition.description = defInput.description;
    }

    const response = await this.runGraphQL(mutation, { definition });

    if (response?.metafieldDefinitionCreate?.userErrors?.length > 0) {
      throw new Error(response.metafieldDefinitionCreate.userErrors[0].message);
    }

    return response?.metafieldDefinitionCreate?.createdDefinition;
  }

  /**
   * -------------------------------------------------------------
   * LOCATIONS & INVENTORY
   * -------------------------------------------------------------
   */

  /**
   * Fetch active locations from Shopify
   */
  static async getLocations() {
    const query = `
      query {
        locations(first: 50) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;
    const response = await this.runGraphQL(query);
    return response?.locations?.edges.map((edge: any) => edge.node) || [];
  }

  /**
   * -------------------------------------------------------------
   * BULK OPERATIONS & STAGED UPLOADS ORCHESTRATION
   * -------------------------------------------------------------
   */

  /**
   * Step 1: Request Staged Upload Target
   */
  static async requestStagedUpload(fileName: string, mimeType: string = 'text/jsonl', fileSize: string = '1024') {
    const mutation = `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters { name value }
          }
          userErrors { field message }
        }
      }
    `;

    const input = [{
      filename: fileName,
      mimeType: mimeType,
      resource: "BULK_MUTATION_VARIABLES",
      httpMethod: "POST",
      fileSize: fileSize.toString()
    }];

    const response = await this.runGraphQL(mutation, { input });

    if (response?.stagedUploadsCreate?.userErrors?.length > 0) {
      throw new Error(response.stagedUploadsCreate.userErrors[0].message);
    }

    return response?.stagedUploadsCreate?.stagedTargets[0];
  }

  /**
   * Step 2: Upload File to Staged Target URL (AWS/GCP)
   */
  static async uploadFileToTarget(target: any, fileContent: string) {
    const formData = new FormData();

    // Shopify requires exactly these parameters in this exact order
    target.parameters.forEach((param: any) => {
      formData.append(param.name, param.value);
    });

    // Create a Blob from the file content
    const blob = new Blob([fileContent], { type: 'text/jsonl' });
    formData.append('file', blob);

    const response = await fetch(target.url, {
      method: 'POST', // The httpMethod from the stagedUploadsCreate response
      body: formData
    });

    if (!response.ok) {
      // The cloud provider (Google/AWS) will return XML errors
      const text = await response.text();
      console.error("Cloud Upload Error:", text);
      throw new Error(`Failed to upload file to cloud storage. Status: ${response.status}`);
    }

    // Shopify bulk operations require the relative path ('key') from the parameters, NOT the full resourceUrl
    const keyParam = target.parameters.find((p: any) => p.name === 'key');
    return keyParam ? keyParam.value : target.resourceUrl;
  }

  /**
   * Step 3: Execute Bulk Mutation
   */
  static async runBulkMutation(stagedUploadPath: string, mutationStr: string) {
    const mutation = `
      mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
        bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) {
          bulkOperation {
            id
            status
            url
          }
          userErrors { field message }
        }
      }
    `;

    const variables = {
      mutation: mutationStr,
      stagedUploadPath: stagedUploadPath
    };

    const response = await this.runGraphQL(mutation, variables);

    if (response?.bulkOperationRunMutation?.userErrors?.length > 0) {
      throw new Error(response.bulkOperationRunMutation.userErrors[0].message);
    }

    return response?.bulkOperationRunMutation?.bulkOperation;
  }

  /**
   * Step 4: Poll Bulk Operation Status
   */
  static async pollBulkOperationStatus() {
    const query = `
      query {
        currentBulkOperation(type: MUTATION) {
          id
          status
          errorCode
          createdAt
          completedAt
          objectCount
          fileSize
          url
          partialDataUrl
        }
      }
    `;

    const response = await this.runGraphQL(query);
    return response?.currentBulkOperation;
  }
  /**
   * -------------------------------------------------------------
   * ORDER TESTING SCENARIOS
   * -------------------------------------------------------------
   */

  /**
   * Fetch active customers to use for test scenarios
   */
  static async fetchTestCustomers(limit: number = 20) {
    const query = `
      query getCustomers($first: Int!) {
        customers(first: $first) {
          edges {
            node {
              id
              email
              firstName
              lastName
              defaultAddress {
                address1
                city
                provinceCode
                countryCode
                zip
              }
            }
          }
        }
      }
    `;
    try {
      const response = await this.runGraphQL(query, { first: limit });
      return response?.customers?.edges.map((edge: any) => edge.node) || [];
    } catch (e: any) {
      console.warn('Customer fetch failed (Protected Customer Data access might be required):', e.message);
      return []; // Return empty array to allow the app to continue gracefully
    }
  }

  /**
   * Fetch active products and their variants for testing
   */
  static async fetchTestProducts(limit: number = 20) {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first, query: "status:active") {
          edges {
            node {
              id
              title
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;
    const response = await this.runGraphQL(query, { first: limit });
    const products = response?.products?.edges.map((edge: any) => edge.node) || [];

    // Flatten into a simple variant array
    const variants: any[] = [];
    for (const p of products) {
      const pVariants = p.variants.edges.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price,
        sku: v.node.sku,
        inventoryQuantity: v.node.inventoryQuantity,
        productId: p.id,
        productTitle: p.title
      }));
      variants.push(...pVariants);
    }

    return variants.filter(v => v.inventoryQuantity > 0).slice(0, limit);
  }

  /**
   * Create a Draft Order
   */
  static async createDraftOrder(input: any) {
    const mutation = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const response = await this.runGraphQL(mutation, { input });
    if (response?.draftOrderCreate?.userErrors?.length > 0) {
      throw new Error(response.draftOrderCreate.userErrors[0].message);
    }
    return response?.draftOrderCreate?.draftOrder;
  }

  /**
   * Complete a Draft Order
   */
  static async completeDraftOrder(id: string) {
    const mutation = `
      mutation draftOrderComplete($id: ID!) {
        draftOrderComplete(id: $id) {
          draftOrder {
            order {
              id
              name
              legacyResourceId
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const response = await this.runGraphQL(mutation, { id });
    if (response?.draftOrderComplete?.userErrors?.length > 0) {
      throw new Error(response.draftOrderComplete.userErrors[0].message);
    }
    return response?.draftOrderComplete?.draftOrder?.order;
  }

  /**
   * Create an Order via REST API
   */
  static async createOrder(orderPayload: any) {
    const payload = { order: orderPayload };
    const response = await this.runREST('orders.json', 'POST', payload);
    return response.order;
  }
}
