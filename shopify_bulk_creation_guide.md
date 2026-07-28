# Shopify Data Creation Guide: Single Item & Bulk Setup Methods
## Comprehensive Guide for Locations, Products, Product Configurations, Inventory, & Orders

This document provides step-by-step instructions for creating data in Shopify both **individually (Single Item)** and **in bulk (Bulk / API)**.

> [!NOTE]
> All GraphQL mutations in this document have been validated against the official **Shopify Admin API schema (v2026-04)** using the Shopify Dev MCP.

---

## 📋 Table of Contents
1. [Locations Setup](#1-locations-setup)
2. [Products & Variants Setup](#2-products--variants-setup)
3. [Product Configurations & Settings](#3-product-configurations--settings)
   - [A. Payment Methods](#a-payment-methods)
   - [B. Carrier & Shipping Methods](#b-carrier--shipping-methods)
   - [C. Sales Channels](#c-sales-channels)
   - [D. Metafields & Metaobjects](#d-metafields--metaobjects)
4. [Inventory Setup & Stock Leveling](#4-inventory-setup--stock-leveling)
5. [Orders & Draft Orders Setup](#5-orders--draft-orders-setup)
6. [Large-Scale Bulk Operations API Framework](#6-large-scale-bulk-operations-api-framework)

---

## 1. Locations Setup

Locations are physical stores, fulfillment hubs, pop-ups, or third-party warehouses.

### Single Item Setup
* **Admin UI**: Go to **Settings** > **Locations** > Click **Add location** > Enter name and address > Select *Inventory at this location is available to fulfill online orders* > Click **Save**.
* **Single API Call (`locationAdd`)**:
  ```graphql
  mutation locationAdd($input: LocationAddInput!) {
    locationAdd(input: $input) {
      location {
        id
        name
        fulfillsOnlineOrders
      }
      userErrors { field message }
    }
  }
  ```
  **Variables Payload:**
  ```json
  {
    "input": {
      "name": "East Coast Warehouse",
      "address": { "address1": "100 Logistics Way", "city": "Boston", "countryCode": "US", "zip": "02108" },
      "fulfillsOnlineOrders": true
    }
  }
  ```

### Bulk Setup
* **Native CSV / Admin UI**: *Not natively supported* in standard Shopify Admin UI.
* **Matrixify App (CSV)**: Prepare a CSV with sheet name `Locations`. Include columns `Name`, `Address1`, `City`, `Zip`, `Country Code`, `Active` (`TRUE`), `Fulfillable` (`TRUE`). Upload to Matrixify.
* **Bulk API (`bulkOperationRunMutation`)**: Wrap `locationAdd` mutation in a `.jsonl` payload and pass to `bulkOperationRunMutation`.

---

## 2. Products & Variants Setup

### Single Item Setup
* **Admin UI**: Go to **Products** > Click **Add product** > Fill Title, Description, Media, Price, SKU, Inventory > Click **Save**.
* **Single API Call (`productCreate`)**:
  ```graphql
  mutation productCreate($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product { id title handle }
      userErrors { field message }
    }
  }
  ```
  **Variables Payload:**
  ```json
  {
    "product": { "title": "Ergonomic Desk Chair", "vendor": "FurniCo", "productType": "Furniture" }
  }
  ```

### Bulk Setup
* **Native CSV Import**:
  1. Go to **Products** > Click **Import**.
  2. Upload `.csv` file with headers: `Handle`, `Title`, `Vendor`, `Type`, `Option1 Name`, `Option1 Value`, `Variant SKU`, `Variant Price`, `Variant Inventory Tracker` (`shopify`).
  3. Click **Upload and preview** > **Import products**.
* **Bulk API (`productVariantsBulkCreate`)**: Create multiple variants under a parent product in a single request.
  ```graphql
  mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      productVariants { id title sku price }
      userErrors { field message }
    }
  }
  ```

---

## 3. Product Configurations & Settings

### A. Payment Methods
Payment methods (Shopify Payments, PayPal, third-party payment gateways) involve security compliance and financial credentials.

* **Single Setup**: Go to **Settings** > **Payments** > Click **Activate Shopify Payments** or **Add payment method** for third-party providers > Complete provider login onboarding.
* **Bulk / API Setup**: Direct bulk creation of payment gateways is **not available** via CSV or Admin API due to PCI-DSS compliance. Payment gateways are integrated programmatically via the **Payments Apps API** at the Shopify Partner level.

---

### B. Carrier & Shipping Methods
Shipping profiles group products and assign location rates.

* **Single Setup (Admin UI)**: Go to **Settings** > **Shipping and delivery** > Open profile > Click **Create zone** > Add rates (flat or calculated) > Click **Save**.
* **Carrier-Calculated Shipping API (Live Rates)**: Register external rate calculation endpoints via REST API:
  `POST /admin/api/2026-04/carrier_services.json`
  ```json
  {
    "carrier_service": {
      "name": "Custom Express Logistics",
      "callback_url": "https://shipping.example.com/rates",
      "service_discovery": true
    }
  }
  ```
* **Bulk API**: Use **Delivery Profiles GraphQL API** (`deliveryProfileCreate`, `deliveryProfileUpdate`) to associate locations, shipping zones, and rates in batch.

---

### C. Sales Channels & Product Availability

* **Single Channel Publishing**: Open product in **Products** > In **Sales channels and apps**, click **Manage** > Check target channels > Click **Save**.
* **Single API Call (`publishablePublish`)**:
  ```graphql
  mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable { availablePublicationsCount { count } }
      userErrors { field message }
    }
  }
  ```
* **Bulk Admin UI**: Go to **Products** > Select all products > Click **Include in sales channels** from bottom bar > Select target channels.
* **Bulk API**: Execute `publishablePublish` with multiple publication inputs in a JSONL file via `bulkOperationRunMutation`.

---

### D. Metafields & Metaobjects (Custom Product Data)

Metafields extend Shopify products, variants, and locations with custom fields.

* **Single Setup (Admin UI)**: Go to **Settings** > **Custom data** > **Products** > **Add definition** > Define Namespace/Key and Data Type > Edit values directly on product page.
* **Single & Bulk API (`metafieldsSet`)**:
  ```graphql
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id namespace key value }
      userErrors { field message }
    }
  }
  ```
  **Variables Payload (Bulk input array):**
  ```json
  {
    "metafields": [
      {
        "ownerId": "gid://shopify/Product/1234567890",
        "namespace": "custom",
        "key": "care_instructions",
        "type": "single_line_text_field",
        "value": "Wipe with damp cloth"
      },
      {
        "ownerId": "gid://shopify/Product/1234567890",
        "namespace": "custom",
        "key": "warranty_years",
        "type": "number_integer",
        "value": "5"
      }
    ]
  }
  ```

---

## 4. Inventory Setup & Stock Leveling

### Single Item Setup
* **Admin UI**: Go to **Products** > **Inventory** > Find item > Click quantity under location column > Enter absolute value or adjustment > Click **Save**.
* **Single API Call (`inventoryActivate` + `inventorySetQuantities`)**:
  ```graphql
  mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup { createdAt }
      userErrors { field message }
    }
  }
  ```

### Bulk Setup
* **Native Inventory CSV Import**:
  1. Go to **Products** > **Inventory** > Click **Export**.
  2. Open CSV and set quantities under `<Location Name> - Available`.
  3. Go to **Products** > **Inventory** > Click **Import** > Upload file.
* **Bulk API (`inventorySetQuantities`)**: Update hundreds of inventory item IDs and location IDs in a single mutation payload.

---

## 5. Orders & Draft Orders Setup

### Single Item Setup
* **Admin UI**: Go to **Orders** > Click **Create order** > Add products, customer, shipping rate, and discounts > Click **Collect payment** or **Mark as paid**.
* **Single API Call (`orderCreate`)**:
  ```graphql
  mutation orderCreate($order: OrderCreateOrderInput!) {
    orderCreate(order: $order) {
      order { id name }
      userErrors { field message }
    }
  }
  ```
  **Variables Payload:**
  ```json
  {
    "order": {
      "lineItems": [
        { "variantId": "gid://shopify/ProductVariant/987654321", "quantity": 2 }
      ],
      "email": "customer@example.com",
      "financialStatus": "PAID"
    }
  }
  ```

### Bulk Setup
* **Matrixify App (CSV/Excel)**: Prepare CSV with sheet `Orders`. Include Order Name, Line Item SKUs, Quantities, Customer Email, Shipping Address, Payment Status (`PAID`). Upload to Matrixify to generate orders in bulk.
* **Bulk API (`bulkOperationRunMutation`)**: Execute `orderCreate` mutations via JSONL batch files for historical order migrations.

---

## 6. Large-Scale Bulk Operations API Framework

For operations exceeding 1,000+ items, use Shopify's asynchronous **Bulk Operations API**:

1. Generate a `.jsonl` file with line-by-line mutation variables:
   ```json
   {"input": {"title": "Product 1", "vendor": "Brand A"}}
   {"input": {"title": "Product 2", "vendor": "Brand B"}}
   ```
2. Upload JSONL to Shopify Staged Uploads.
3. Trigger the asynchronous execution:
   ```graphql
   mutation bulkOperationRunMutation($mutation: String!, $stagedUploadPath: String!) {
     bulkOperationRunMutation(mutation: $mutation, stagedUploadPath: $stagedUploadPath) {
       bulkOperation { id status }
       userErrors { field message }
     }
   }
   ```
