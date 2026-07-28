# Shopify Bulk Operations SOP

*This document was meticulously crafted based on the Shopify Data Creation Guide (API v2026-04).*
*It is structured so that you can easily copy and paste its contents directly into a Google Sheet or Excel Workbook. Each major heading represents a separate worksheet.*

---

## Sheet 1: Process Summary

| Process Name | Purpose | Manual Steps | Single API | Bulk API | Bulk Data Sheet |
| ------------ | ------- | ------------ | ---------- | -------- | --------------- |
| Create Locations | To add physical stores, warehouses, or fulfillment hubs. | Open Shopify Admin.... | `Location Add (GraphQL)` | `GraphQL Bulk Operation (`locationAdd`)` | Create Locations |
| Create Products | To add brand new products to the Shopify store. | Open Shopify Admin.... | `Create Product (GraphQL)` | `GraphQL Bulk Operation (`productSet`)` | Create Products |
| Create Product Variants | To create multiple variations (like size or color) under an existing parent product. | Open Shopify Admin.... | `Product Variants Bulk Create (GraphQL)` | `GraphQL Mutation (`productVariantsBulkCreate`)` | Create Product Variants |
| Setup Shipping Carriers | To register external shipping rate calculation endpoints for live carrier rates. | Open Shopify Admin.... | `Carrier Services (REST)` | `REST API Iteration` | Setup Shipping Carriers |
| Publish Sales Channels | To make products available and visible on specific sales channels (like Point of Sale or Online Store). | Open Shopify Admin.... | `Publishable Publish (GraphQL)` | `GraphQL Bulk Operation (`publishablePublish`)` | Publish Sales Channels |
| Update Metafields | To add or update custom data fields on products, variants, or locations. | Open Shopify Admin.... | `Metafields Set (GraphQL)` | `GraphQL Bulk Operation (`metafieldsSet`)` | Update Metafields |
| Activate Inventory Location | To activate an inventory item at a specific location before updating quantities. | N/A | `Inventory Activate (GraphQL)` | N/A | Update Inventory |
| Update Inventory | To accurately set or change the stock levels of products at a specific location. | Open Shopify Admin.... | `Inventory Set Quantities (GraphQL)` | `GraphQL Bulk Operation (`inventorySetQuantities`)` | Update Inventory |
| Create Orders | To create historical orders, draft orders, or migrate past sales data into Shopify. | Open Shopify Admin.... | `Order Create (GraphQL)` | `GraphQL Bulk Operation (`orderCreate`)` | Create Orders |

---

## Sheet 2: Create Locations

# Section 1: Process Overview
**Process Name:** Create Locations
**Objective:** To add physical stores, warehouses, or fulfillment hubs.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Settings** on the bottom left.
Step 3: Click **Locations**.
Step 4: Click **Add location**.
Step 5: Enter the Location Name.
Step 6: Enter the Address details.
Step 7: Check the box *Inventory at this location is available to fulfill online orders*.
Step 8: Click **Save**.


# Section 4: Single API Details
* **API Name:** Location Add (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation locationAdd($input: LocationAddInput!) { locationAdd(input: $input) { location { id name } } }",
  "variables": {
    "input": {
      "name": "East Coast Warehouse",
      "address": {
        "address1": "100 Logistics Way",
        "city": "Boston",
        "countryCode": "US",
        "zip": "02108"
      },
      "fulfillsOnlineOrders": true
    }
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "locationAdd": {
      "location": {
        "id": "gid://shopify/Location/123456789",
        "name": "East Coast Warehouse"
      }
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** GraphQL Bulk Operation (`locationAdd`)
* **Execution Flow (Postman Collection Sequence):**
  1. **Create Staged Upload Target:** Run this API to get a staging URL and parameters.
  2. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 1 to upload your `.jsonl` payload.
  3. **Start Bulk Import:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 1 to begin processing.
  4. **Check Bulk Import Status:** Periodically run this API (`currentBulkOperation`) until the status is `COMPLETED`.
* **Bulk Payload Concept:**
```json
{
  "input": {
    "name": "Warehouse B",
    "fulfillsOnlineOrders": true
  }
}
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation locationAdd($input: LocationAddInput!) { locationAdd(input: $input) { location { id name } } }",
  "variables": {
    "input": {
      "name": "East Coast Warehouse",
      "address": {
        "address1": "100 Logistics Way",
        "city": "Boston",
        "countryCode": "US",
        "zip": "02108"
      },
      "fulfillsOnlineOrders": true
    }
  }
}
```

# Section 8: Bulk Data Template
| Location Name | Address1 | City | Zip | Country Code | Fulfills Online Orders |
| --- | --- | --- | --- | --- | --- |
| NY Store | 123 Broadway | New York | 10001 | US | TRUE |
| LA Warehouse | 456 Hollywood Blvd | Los Angeles | 90028 | US | TRUE |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Location Name:** Data for this specific attribute.
* **Address1:** Data for this specific attribute.
* **City:** Data for this specific attribute.
* **Zip:** Data for this specific attribute.
* **Country Code:** Data for this specific attribute.
* **Fulfills Online Orders:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 3: Create Products

# Section 1: Process Overview
**Process Name:** Create Products
**Objective:** To add brand new products to the Shopify store.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Products** on the left menu.
Step 3: Click **Add product**.
Step 4: Enter Title and Description.
Step 5: Add Media (Images).
Step 6: Enter Price.
Step 7: Enter SKU and Inventory.
Step 8: Click **Save**.


# Section 4: Single API Details
* **API Name:** Create Product (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation productCreate($product: ProductCreateInput!) { productCreate(product: $product) { product { id title } } }",
  "variables": {
    "product": {
      "title": "Ergonomic Desk Chair",
      "vendor": "FurniCo",
      "productType": "Furniture"
    }
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "productCreate": {
      "product": {
        "id": "gid://shopify/Product/123456",
        "title": "Ergonomic Desk Chair"
      }
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** GraphQL Bulk Operation (`productSet`)
* **Execution Flow (Postman Collection Sequence):**
  1. **Create Staged Upload Target:** Run this API to get a staging URL and parameters.
  2. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 1 to upload your `.jsonl` payload.
  3. **Start Bulk Import:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 1 to begin processing.
  4. **Check Bulk Import Status:** Periodically run this API (`currentBulkOperation`) until the status is `COMPLETED`.
* **Bulk Payload Concept:**
```json
{
  "input": {
    "title": "Sample Product",
    "vendor": "Brand",
    "variants": [
      {
        "price": "19.99",
        "inventoryPolicy": "DENY",
        "inventoryItem": {
          "tracked": true
        }
      }
    ]
  }
}
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation productCreate($product: ProductCreateInput!) { productCreate(product: $product) { product { id title } } }",
  "variables": {
    "product": {
      "title": "Ergonomic Desk Chair",
      "vendor": "FurniCo",
      "productType": "Furniture"
    }
  }
}
```

# Section 8: Bulk Data Template
| Product Title | Vendor | Product Type |
| --- | --- | --- |
| Office Desk | FurniCo | Furniture |
| Gaming Chair | FurniCo | Furniture |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Product Title:** Data for this specific attribute.
* **Vendor:** Data for this specific attribute.
* **Product Type:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 4: Create Product Variants

# Section 1: Process Overview
**Process Name:** Create Product Variants
**Objective:** To create multiple variations (like size or color) under an existing parent product.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Products** and open a product.
Step 3: Scroll down to the **Variants** section.
Step 4: Click **Add options like size or color**.
Step 5: Enter Option Name (e.g., Size) and Values (e.g., Small, Medium).
Step 6: Click **Save**.


# Section 4: Single API Details
* **API Name:** Product Variants Bulk Create (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $productId, variants: $variants) { productVariants { id sku price } } }",
  "variables": {
    "productId": "gid://shopify/Product/123456",
    "variants": [
      {
        "price": "19.99",
        "sku": "CHAIR-BLK"
      },
      {
        "price": "24.99",
        "sku": "CHAIR-RED"
      }
    ]
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "productVariantsBulkCreate": {
      "productVariants": [
        {
          "id": "gid://shopify/ProductVariant/111",
          "sku": "CHAIR-BLK",
          "price": "19.99"
        }
      ]
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** GraphQL Mutation (`productVariantsBulkCreate`)
* **Execution Flow (Postman Collection Sequence):**
  1. **Create Staged Upload Target:** Run this API to get a staging URL and parameters.
  2. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 1 to upload your `.jsonl` payload.
  3. **Start Bulk Import:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 1 to begin processing.
  4. **Check Bulk Import Status:** Periodically run this API (`currentBulkOperation`) until the status is `COMPLETED`.
* **Bulk Payload Concept:**
```json
Use the single API structure directly as it supports bulk creation internally.
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $productId, variants: $variants) { productVariants { id sku price } } }",
  "variables": {
    "productId": "gid://shopify/Product/123456",
    "variants": [
      {
        "price": "19.99",
        "sku": "CHAIR-BLK"
      },
      {
        "price": "24.99",
        "sku": "CHAIR-RED"
      }
    ]
  }
}
```

# Section 8: Bulk Data Template
| Parent Product ID | Variant SKU | Variant Price |
| --- | --- | --- |
| gid://shopify/Product/123 | SKU-S | 10.00 |
| gid://shopify/Product/123 | SKU-M | 12.00 |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Parent Product ID:** Data for this specific attribute.
* **Variant SKU:** Data for this specific attribute.
* **Variant Price:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 5: Setup Shipping Carriers

# Section 1: Process Overview
**Process Name:** Setup Shipping Carriers
**Objective:** To register external shipping rate calculation endpoints for live carrier rates.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Settings** > **Shipping and delivery**.
Step 3: Open a shipping profile.
Step 4: Click **Create zone**.
Step 5: Add flat rates or calculated rates.
Step 6: Click **Save**.


# Section 4: Single API Details
* **API Name:** Carrier Services (REST)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/carrier_services.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "carrier_service": {
    "name": "Custom Express Logistics",
    "callback_url": "https://shipping.example.com/rates",
    "service_discovery": true
  }
}
```
* **Sample Response:**
```json
{
  "carrier_service": {
    "id": 123456,
    "name": "Custom Express Logistics"
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** REST API Iteration
* **Bulk Payload Concept:**
```json
N/A - Usually set up one by one via REST API script.
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "carrier_service": {
    "name": "Custom Express Logistics",
    "callback_url": "https://shipping.example.com/rates",
    "service_discovery": true
  }
}
```

# Section 8: Bulk Data Template
| Carrier Name | Callback URL | Service Discovery |
| --- | --- | --- |
| FastShip | https://api.fastship.com/rates | TRUE |
| EcoDelivery | https://api.eco.com/rates | TRUE |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Carrier Name:** Data for this specific attribute.
* **Callback URL:** Data for this specific attribute.
* **Service Discovery:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 6: Publish Sales Channels

# Section 1: Process Overview
**Process Name:** Publish Sales Channels
**Objective:** To make products available and visible on specific sales channels (like Point of Sale or Online Store).
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Products** and open a product.
Step 3: In the right sidebar under **Sales channels and apps**, click **Manage**.
Step 4: Check the boxes for the target channels.
Step 5: Click **Done**, then **Save**.


# Section 4: Single API Details
* **API Name:** Publishable Publish (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { publishable { availablePublicationsCount { count } } } }",
  "variables": {
    "id": "gid://shopify/Product/123456789",
    "input": [
      {
        "publicationId": "gid://shopify/Publication/987654321"
      }
    ]
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "publishablePublish": {
      "publishable": {
        "availablePublicationsCount": {
          "count": 1
        }
      }
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** GraphQL Bulk Operation (`publishablePublish`)
* **Execution Flow (Postman Collection Sequence):**
  1. **Create Staged Upload Target:** Run this API to get a staging URL and parameters.
  2. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 1 to upload your `.jsonl` payload.
  3. **Start Bulk Import:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 1 to begin processing.
  4. **Check Bulk Import Status:** Periodically run this API (`currentBulkOperation`) until the status is `COMPLETED`.
* **Bulk Payload Concept:**
```json
{
  "id": "gid://shopify/Product/123",
  "input": [
    {
      "publicationId": "gid://shopify/Publication/987"
    }
  ]
}
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { publishable { availablePublicationsCount { count } } } }",
  "variables": {
    "id": "gid://shopify/Product/123456789",
    "input": [
      {
        "publicationId": "gid://shopify/Publication/987654321"
      }
    ]
  }
}
```

# Section 8: Bulk Data Template
| Product ID | Publication ID |
| --- | --- |
| gid://shopify/Product/111 | gid://shopify/Publication/999 |
| gid://shopify/Product/222 | gid://shopify/Publication/999 |
| Sample Data | Sample Data |
| Sample Data | Sample Data |
| Sample Data | Sample Data |
| Sample Data | Sample Data |
| Sample Data | Sample Data |
| Sample Data | Sample Data |
| Sample Data | Sample Data |
| Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Product ID:** Data for this specific attribute.
* **Publication ID:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 7: Update Metafields

# Section 1: Process Overview
**Process Name:** Update Metafields
**Objective:** To add or update custom data fields on products, variants, or locations.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Settings** > **Custom data**.
Step 3: Select **Products**.
Step 4: Click **Add definition** and create a Namespace and Key.
Step 5: Go back to a Product and scroll to the bottom.
Step 6: Enter the value in the Metafield section and click **Save**.


# Section 4: Single API Details
* **API Name:** Metafields Set (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id namespace key value } } }",
  "variables": {
    "metafields": [
      {
        "ownerId": "gid://shopify/Product/1234567890",
        "namespace": "custom",
        "key": "care_instructions",
        "type": "single_line_text_field",
        "value": "Wipe with damp cloth"
      }
    ]
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "metafieldsSet": {
      "metafields": [
        {
          "id": "gid://shopify/Metafield/111",
          "namespace": "custom",
          "key": "care_instructions",
          "value": "Wipe with damp cloth"
        }
      ]
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** GraphQL Bulk Operation (`metafieldsSet`)
* **Execution Flow (Postman Collection Sequence):**
  1. **Create Staged Upload Target:** Run this API to get a staging URL and parameters.
  2. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 1 to upload your `.jsonl` payload.
  3. **Start Bulk Import:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 1 to begin processing.
  4. **Check Bulk Import Status:** Periodically run this API (`currentBulkOperation`) until the status is `COMPLETED`.
* **Bulk Payload Concept:**
```json
Same structure as Single API. The mutation naturally accepts an array of metafield inputs.
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { id namespace key value } } }",
  "variables": {
    "metafields": [
      {
        "ownerId": "gid://shopify/Product/1234567890",
        "namespace": "custom",
        "key": "care_instructions",
        "type": "single_line_text_field",
        "value": "Wipe with damp cloth"
      }
    ]
  }
}
```

# Section 8: Bulk Data Template
| Owner ID | Namespace | Key | Type | Value |
| --- | --- | --- | --- | --- |
| gid://shopify/Product/123 | custom | material | single_line_text_field | 100% Cotton |
| gid://shopify/Product/123 | custom | warranty_years | number_integer | 5 |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Owner ID:** Data for this specific attribute.
* **Namespace:** Data for this specific attribute.
* **Key:** Data for this specific attribute.
* **Type:** Data for this specific attribute.
* **Value:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 8: Update Inventory

# Section 1: Process Overview
**Process Name:** Update Inventory
**Objective:** To accurately set or change the stock levels of products at a specific location.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Products** > **Inventory**.
Step 3: Find the specific item.
Step 4: Click the quantity under the location column.
Step 5: Enter the new absolute value or adjustment.
Step 6: Click **Save**.


# Section 4: Single API Details
* **API Name:** Inventory Set Quantities (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation InventorySet($input: InventorySetQuantitiesInput!) { inventorySetQuantities(input: $input) { inventoryAdjustmentGroup { createdAt reason changes { name delta } } userErrors { field message } } }",
  "variables": {
    "input": {
      "name": "available",
      "reason": "correction",
      "ignoreCompareQuantity": true,
      "quantities": [
        {
          "inventoryItemId": "gid://shopify/InventoryItem/52723924664543",
          "locationId": "gid://shopify/Location/90860716255",
          "quantity": 1200,
          "compareQuantity": null
        }
      ]
    }
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "inventorySetQuantities": {
      "inventoryAdjustmentGroup": {
        "createdAt": "2026-07-28T12:00:00Z",
        "reason": "correction",
        "changes": [
          {
            "name": "available",
            "delta": 1150
          }
        ]
      },
      "userErrors": []
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 4.1: Prerequisite - Activate Inventory Location
* **Purpose:** Before updating inventory at a new location, the inventory item must be activated at that location.
* **API Name:** Inventory Activate (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2025-07/graphql.json`
* **Complete Request Body:**
```json
{
  "query": "mutation ActivateInventory($inventoryItemId: ID!, $locationId: ID!) { inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) { inventoryLevel { id } userErrors { field message } } }",
  "variables": {
    "inventoryItemId": "{{inventoryItemId}}",
    "locationId": "{{locationId}}"
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "inventoryActivate": {
      "inventoryLevel": {
        "id": "gid://shopify/InventoryLevel/12345?inventory_item_id=52723924664543"
      },
      "userErrors": []
    }
  }
}
```

# Section 5: Bulk API Details
* **Method:** GraphQL Bulk Operation (`inventorySetQuantities`)
* **Execution Flow (Postman Collection Sequence for Inventory):**
  1. **Fetch Inventory Item:** Retrieve the inventory item details for the products.
  2. **Activate Inventory Location:** Ensure the inventory items are activated at the desired location (`inventoryActivate`).
  3. **Create Staged Upload Target:** Run this API to get a staging URL and parameters for the inventory bulk payload.
  4. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 3 to upload your `.jsonl` payload.
  5. **Bulk Inventory Update:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 3 to begin processing.
  6. **Check Bulk Import Status:** Periodically poll `currentBulkOperation` until `COMPLETED`.
  7. **Inventory Bulk Track:** (Optional) Run the track endpoint to set inventory items to tracked.
* **Bulk Payload Concept:**
```json
Use the Bulk Operation endpoint by passing JSONL records matching the `input` variable.
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) { inventorySetQuantities(input: $input) { inventoryAdjustmentGroup { id } } }",
  "variables": {
    "input": {
      "name": "available",
      "reason": "correction",
      "ignoreCompareQuantity": true,
      "quantities": [
        {
          "inventoryItemId": "gid://shopify/InventoryItem/12345",
          "locationId": "gid://shopify/Location/67890",
          "quantity": 150
        }
      ]
    }
  }
}
```

# Section 8: Bulk Data Template
| Inventory Item ID | Location ID | State | Quantity |
| --- | --- | --- | --- |
| gid://shopify/InventoryItem/111 | gid://shopify/Location/222 | available | 100 |
| gid://shopify/InventoryItem/333 | gid://shopify/Location/222 | available | 50 |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Inventory Item ID:** Data for this specific attribute.
* **Location ID:** Data for this specific attribute.
* **State:** Data for this specific attribute.
* **Quantity:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---

## Sheet 9: Create Orders

# Section 1: Process Overview
**Process Name:** Create Orders
**Objective:** To create historical orders, draft orders, or migrate past sales data into Shopify.
**When should this process be used?** When performing data migrations, importing large lists, or running massive updates via Postman.
**Expected Result:** The operation will be successfully reflected in the Shopify Admin.

# Section 2: Prerequisites
* **Shopify Admin access:** To verify the data changes.
* **API Token:** A secret token (like `shpat_...`) with proper permissions (Scopes) to perform this action.
* **Store Name:** The URL of your store (e.g., `my-store-name.myshopify.com`).
* **Postman installed:** To send the API requests.
* **Data IDs:** Any specific Global IDs (`gid://...`) needed for relationships.

# Section 3: Manual Process
Step 1: Open Shopify Admin.
Step 2: Click **Orders**.
Step 3: Click **Create order** (top right).
Step 4: Add products using the search bar.
Step 5: Add a customer.
Step 6: Select a shipping rate and discounts.
Step 7: Click **Collect payment** or **Mark as paid**.


# Section 4: Single API Details
* **API Name:** Order Create (GraphQL)
* **HTTP Method:** POST
* **Endpoint URL:** `https://{store_name}.myshopify.com/admin/api/2026-04/graphql.json`
* **Authentication Type:** Access Token header (`X-Shopify-Access-Token`)
* **Required Headers:**
  * `X-Shopify-Access-Token`: (your token)
  * `Content-Type`: `application/json`
* **Complete Request Body:**
```json
{
  "query": "mutation orderCreate($order: OrderCreateOrderInput!) { orderCreate(order: $order) { order { id name } } }",
  "variables": {
    "order": {
      "lineItems": [
        {
          "variantId": "gid://shopify/ProductVariant/987654321",
          "quantity": 2
        }
      ],
      "email": "customer@example.com",
      "financialStatus": "PAID"
    }
  }
}
```
* **Sample Response:**
```json
{
  "data": {
    "orderCreate": {
      "order": {
        "id": "gid://shopify/Order/12345",
        "name": "#1001"
      }
    }
  }
}
```
* **Success Validation:** Check Postman for a `200 OK` or `201 Created` status.

# Section 5: Bulk API Details
* **Method:** GraphQL Bulk Operation (`orderCreate`)
* **Execution Flow (Postman Collection Sequence):**
  1. **Create Staged Upload Target:** Run this API to get a staging URL and parameters.
  2. **Upload JSONL File to Staged Storage:** Use the URL and parameters from Step 1 to upload your `.jsonl` payload.
  3. **Start Bulk Import:** Run this API (`bulkOperationRunMutation`) with the `stagedUploadPath` from Step 1 to begin processing.
  4. **Check Bulk Import Status:** Periodically run this API (`currentBulkOperation`) until the status is `COMPLETED`.
* **Bulk Payload Concept:**
```json
{
  "order": {
    "lineItems": [
      {
        "variantId": "gid://shopify/ProductVariant/123",
        "quantity": 1
      }
    ],
    "email": "test@test.com",
    "financialStatus": "PAID"
  }
}
```

# Section 6: How to Run the API in Postman
Step 1: Open Postman.
Step 2: Click **New** -> **HTTP Request**.
Step 3: Select **POST** as the method.
Step 4: Paste the endpoint URL into the address bar.
Step 5: Open the **Headers** tab.
Step 6: Add `X-Shopify-Access-Token` with your API token.
Step 7: Add `Content-Type` with `application/json`.
Step 8: Open the **Body** tab.
Step 9: Select **Raw** and then **JSON**.
Step 10: Paste the complete request body from Section 7.
Step 11: Click **Send**.
Step 12: Verify the response at the bottom.

# Section 7: Sample Single API Data
```json
{
  "query": "mutation orderCreate($order: OrderCreateOrderInput!) { orderCreate(order: $order) { order { id name } } }",
  "variables": {
    "order": {
      "lineItems": [
        {
          "variantId": "gid://shopify/ProductVariant/987654321",
          "quantity": 2
        }
      ],
      "email": "customer@example.com",
      "financialStatus": "PAID"
    }
  }
}
```

# Section 8: Bulk Data Template
| Customer Email | Variant ID | Quantity | Financial Status |
| --- | --- | --- | --- |
| john@test.com | gid://shopify/ProductVariant/111 | 1 | PAID |
| jane@test.com | gid://shopify/ProductVariant/222 | 2 | PAID |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |
| Sample Data | Sample Data | Sample Data | Sample Data |


# Section 9: Field Description
*(Each column from Section 8 represents the data points needed for the API variables).*
* **Customer Email:** Data for this specific attribute.
* **Variant ID:** Data for this specific attribute.
* **Quantity:** Data for this specific attribute.
* **Financial Status:** Data for this specific attribute.


# Section 10: Validation Rules
* **Mandatory fields:** Ensure all required IDs (like `gid://shopify/...`) are valid.
* **Accepted values:** Boolean fields must be `true` or `false` (no quotes in JSON).
* **Common mistakes to avoid:** Passing REST integer IDs when the GraphQL endpoint requires full `gid://` formatting.

# Section 11: Common Errors & Solutions
| Error | Reason | Solution |
| ----- | ------ | -------- |
| `401 Unauthorized` | Invalid Token | Double-check the token and permissions. |
| `userErrors` (GraphQL) | Data Validation | Read the `message` field inside the JSON response. |
| `404 Not Found` | Wrong Endpoint | Check your store URL and API version (`2026-04`). |

# Section 12: Verification Steps
1. Log into Shopify Admin.
2. Navigate to the relevant section (Products, Orders, Settings, etc.).
3. Search for the item you just created/updated.
4. Confirm the data matches your API request.

# Section 13: Notes
* **API Limits:** Shopify GraphQL operates on a calculated query cost. Stay within the 50 points/second bucket.
* **Bulk API:** Use `bulkOperationRunMutation` for datasets larger than 1,000 rows to avoid timeouts.

---
