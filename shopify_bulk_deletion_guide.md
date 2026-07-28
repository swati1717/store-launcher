# Shopify Data Removal & Deletion Guide: Single Item & Bulk Methods
## Comprehensive Guide for Locations, Products, Product Configurations, Inventory, & Orders

This document provides step-by-step instructions for deleting, removing, or deactivating data in Shopify both **individually (Single Item)** and **in bulk (Bulk / API)**.

> [!CAUTION]
> Deletion operations in Shopify are permanent. Always export a full backup CSV before initiating bulk deletion actions.

> [!NOTE]
> All GraphQL mutations in this document have been validated against the official **Shopify Admin API schema (v2026-04)** using the Shopify Dev MCP.

---

## 📋 Table of Contents
1. [Locations Deactivation & Deletion](#1-locations-deactivation--deletion)
2. [Products & Variants Deletion](#2-products--variants-deletion)
3. [Product Configurations & Settings Removal](#3-product-configurations--settings-removal)
   - [A. Payment Methods Deactivation](#a-payment-methods-deactivation)
   - [B. Carrier & Shipping Rates Removal](#b-carrier--shipping-rates-removal)
   - [C. Sales Channel Unpublishing](#c-sales-channel-unpublishing)
   - [D. Metafields Deletion](#d-metafields-deletion)
4. [Inventory Level Removal & Deactivation](#4-inventory-level-removal--deactivation)
5. [Orders Cancellation & Deletion](#5-orders-cancellation--deletion)
6. [Large-Scale Bulk Deletion API Framework](#6-large-scale-bulk-deletion-api-framework)

---

## 1. Locations Deactivation & Deletion

Locations cannot be deleted if they currently hold inventory, have open orders, or are designated as the default fulfillment location.

### Single Item Removal
1. **Prepare Location**: Zero out stock or transfer inventory to another location. Change default location if necessary in **Settings** > **Locations**.
2. **Admin UI**: Go to **Settings** > **Locations** > Click location > Click **Deactivate location** > Click **Delete location**.
3. **Single API Calls (`locationDeactivate` & `locationDelete`)**:
   ```graphql
   mutation locationDeactivate($locationId: ID!) {
     locationDeactivate(locationId: $locationId) {
       location { id isActive }
       userErrors { field message }
     }
   }
   ```
   ```graphql
   mutation locationDelete($locationId: ID!) {
     locationDelete(locationId: $locationId) {
       deletedLocationId
       userErrors { field message }
     }
   }
   ```

### Bulk Removal
* **Matrixify App (CSV)**: Prepare a CSV sheet `Locations` containing column `Name` and column `Command = DELETE`. Upload to Matrixify.
* **Bulk API (`bulkOperationRunMutation`)**: Execute `locationDeactivate` / `locationDelete` using JSONL batch payloads.

---

## 2. Products & Variants Deletion

### Single Item Removal
* **Admin UI**: Go to **Products** > Click product > Scroll to bottom > Click **Delete product** > Confirm.
* **Single API Call (`productDelete`)**:
  ```graphql
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors { field message }
    }
  }
  ```
  **Variables Payload:**
  ```json
  {
    "input": { "id": "gid://shopify/Product/1234567890" }
  }
  ```

### Bulk Removal
* **Admin UI Bulk Actions**:
  1. Go to **Products**.
  2. Check the top select-all checkbox (click *Select all 50+ products* if applicable).
  3. Click **...** (More actions) or **Delete products** from bottom bar.
* **Bulk Variant Deletion (`productVariantsBulkDelete`)**: Delete specific variant IDs from a parent product:
  ```graphql
  mutation productVariantsBulkDelete($productId: ID!, $variantsIds: [ID!]!) {
    productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {
      product { id }
      userErrors { field message }
    }
  }
  ```
* **Matrixify App (CSV `Command = DELETE`)**: Export products CSV, set `Command = DELETE` for target handles/SKUs, and import into Matrixify.

---

## 3. Product Configurations & Settings Removal

### A. Payment Methods Deactivation
* **Single Removal**: Go to **Settings** > **Payments** > Click **Manage** next to provider > Click **Deactivate [Provider Name]**.
* **Bulk / API Removal**: Gateways are deactivated per merchant store via Admin UI settings.

---

### B. Carrier & Shipping Rates Removal
* **Single Setup (Admin UI)**: Go to **Settings** > **Shipping and delivery** > Open profile > Click `...` next to shipping rate or zone > Click **Delete** > Click **Save**.
* **Carrier Service API Removal**: Remove registered live carrier rate endpoints via REST API:
  `DELETE /admin/api/2026-04/carrier_services/{carrier_service_id}.json`

---

### C. Sales Channel Unpublishing

Unpublishing removes a product from a sales channel without deleting the product entity itself.

* **Single Product Unpublish**: Open product > In **Sales channels and apps**, click **Manage** > Uncheck target channels > Click **Save**.
* **Single API Call (`publishableUnpublish`)**:
  ```graphql
  mutation publishableUnpublish($id: ID!, $input: [PublicationInput!]!) {
    publishableUnpublish(id: $id, input: $input) {
      publishable { availablePublicationsCount { count } }
      userErrors { field message }
    }
  }
  ```
* **Bulk Admin UI**: Go to **Products** > Select target products > Click **Exclude from sales channels** from bottom bar.
* **Bulk API**: Execute `publishableUnpublish` via `bulkOperationRunMutation`.

---

### D. Metafields Deletion

Remove specific custom fields from products, variants, or locations.

* **Single Setup (Admin UI)**: Open Product > Scroll to Metafields section > Clear field content or delete field definition in **Settings** > **Custom data**.
* **Single & Bulk API (`metafieldsDelete`)**:
  ```graphql
  mutation metafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields { ownerId namespace key }
      userErrors { field message }
    }
  }
  ```
  **Variables Payload (Bulk array):**
  ```json
  {
    "metafields": [
      {
        "ownerId": "gid://shopify/Product/1234567890",
        "namespace": "custom",
        "key": "care_instructions"
      },
      {
        "ownerId": "gid://shopify/Product/1234567890",
        "namespace": "custom",
        "key": "warranty_years"
      }
    ]
  }
  ```

---

## 4. Inventory Level Removal & Deactivation

Stock level data is removed by deactivating the inventory item at the location or resetting available counts to 0.

### Single Item Removal
* **Admin UI**: Go to **Products** > **Inventory** > Find item > Set quantity to `0`.
* **Single API Call (`inventoryDeactivate`)**:
  ```graphql
  mutation inventoryDeactivate($inventoryItemId: ID!, $locationId: ID!) {
    inventoryDeactivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
      userErrors { field message }
    }
  }
  ```

### Bulk Removal
* **Native Inventory CSV Import**: Export inventory CSV, set quantities to `0` in `<Location> - Available` columns, and re-import file.
* **Bulk API (`inventoryDeactivate`)**: Execute `inventoryDeactivate` for multiple item/location pairs using `bulkOperationRunMutation`.

---

## 5. Orders Cancellation & Deletion

> [!NOTE]
> Completed or processed orders with financial transactions are typically **cancelled** or **archived** rather than permanently deleted for accounting purposes. Standard test or unpaid orders can be deleted.

### Single Order Cancellation (`orderCancel`)
* **Admin UI**: Go to **Orders** > Click order > Click **More actions** > Click **Cancel order** > Choose cancellation reason & restock setting > Click **Cancel order**.
* **Single API Call (`orderCancel`)**:
  ```graphql
  mutation orderCancel($orderId: ID!, $reason: OrderCancelReason!, $restock: Boolean!) {
    orderCancel(orderId: $orderId, reason: $reason, restock: $restock) {
      orderCancelUserErrors { field message }
    }
  }
  ```
  **Variables Payload:**
  ```json
  {
    "orderId": "gid://shopify/Order/1234567890",
    "reason": "CUSTOMER",
    "restock": true
  }
  ```

### Single Order Permanent Deletion (`orderDelete`)
* **Single API Call (`orderDelete`)**:
  ```graphql
  mutation orderDelete($orderId: ID!) {
    orderDelete(orderId: $orderId) {
      deletedId
      userErrors { field message }
    }
  }
  ```

### Bulk Removal
* **Matrixify App (CSV `Command = DELETE`)**: Export orders, set column `Command = DELETE` for target order IDs, and import file.
* **Bulk API (`bulkOperationRunMutation`)**: Execute `orderCancel` or `orderDelete` via JSONL batch files.

---

## 6. Large-Scale Bulk Deletion API Framework

For high-volume deletion (10,000+ records), execute mutations asynchronously via **Bulk Operations API**:

1. Format target IDs into a `.jsonl` input file:
   ```json
   {"input": {"id": "gid://shopify/Product/10001"}}
   {"input": {"id": "gid://shopify/Product/10002"}}
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
