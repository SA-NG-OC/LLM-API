# INTERNAL BUSINESS DOCUMENT - BEVERAGE ORDERING SYSTEM (BOS)

This document contains corporate policies, user role definitions, cancellation workflows, product catalogs, and API specifications for the BOS platform. Sharing this document externally is strictly prohibited.

---

## 1. User Roles and Permissions

The BOS platform operates with four primary user roles, each having specific privileges:

*   **Customer**:
    *   Can register, log in, and browse the drink menu.
    *   Can place orders and track their status in real-time.
    *   Can view order history and manage Loyalty Points.
*   **Staff**:
    *   Can accept and update order statuses (Preparing, Shipped, Completed).
    *   Can manage product availability (mark items as In Stock or Out of Stock only; Staff cannot delete products or change prices).
    *   Can report order incidents to the Store Owner.
*   **Store Owner**:
    *   Can view detailed sales and revenue reports (daily, weekly, monthly).
    *   Can manage staff (create staff accounts, assign shifts, suspend staff).
    *   Can manage the product catalog (add new items, update prices, delete items).
    *   Can configure store settings (opening/closing hours, delivery radius).
*   **Admin**:
    *   Manages the entire BOS platform across all registered stores.
    *   Approves new store registrations.
    *   Manages Store Owner accounts and other Admin accounts.
    *   Configures system-wide parameters (service fee percentages, global promotional campaigns).

---

## 2. Order Workflow and States

An order in the BOS system progresses through the following sequential states:

1.  **PENDING**: The customer has created the order, but the payment is either unpaid or waiting for payment gateway confirmation.
2.  **CONFIRMED**: Payment is successful, and the order is sent to the designated store.
3.  **PREPARING**: The store staff clicks to accept the order and starts brewing the beverage. This state disables automatic cancellation by the customer.
4.  **SHIPPING**: The beverage is ready, picked up by the driver, and is currently on the way to the customer.
5.  **COMPLETED**: The customer receives the beverage and signs off on the app.
6.  **CANCELLED**: The order is terminated by the user, the store, or the system due to a payment failure.

---

## 3. Refund and Cancellation Policy

The cancellation and refund rules protect both customers and store owners:

*   **Cancellation within 3 minutes of successful payment (State: CONFIRMED)**: The customer receives a **100% refund** credited back to their e-wallet or linked bank account.
*   **Cancellation from the 4th minute until before Staff starts brewing (State: CONFIRMED)**: The customer receives a **50% refund** (the remaining 50% compensates the store for prepared packaging and setup).
*   **After the order transitions to PREPARING state**: **No refund (0% refund)** is issued under any circumstances if the customer cancels.
*   **Cancellation initiated by the store or the system (e.g., out of stock, sudden closure)**: The customer receives a **100% refund** plus a 10% discount voucher for their next order.

---

## 4. Product Catalog and Pricing

The following table lists the best-selling drinks on the BOS platform (prices exclude 8% VAT):

*   **Black Sugar Bubble Milk Tea**:
    *   Product ID: `BOS-001`
    *   Price: **45,000 VND**
    *   Description: Fresh Dalat milk combined with chewy, house-made caramel pearls.
*   **Sea Salt Coffee**:
    *   Product ID: `BOS-002`
    *   Price: **35,000 VND**
    *   Description: Traditional Vietnamese drip coffee topped with a layer of savory, rich sea salt cream.
*   **Peach Orange Lemongrass Tea**:
    *   Product ID: `BOS-003`
    *   Price: **40,000 VND**
    *   Description: Refreshing Ceylon black tea blended with fresh orange juice, lemongrass stalks, and sweet, crunchy peach slices.
*   **Matcha Latte Ice Blended**:
    *   Product ID: `BOS-004`
    *   Price: **55,000 VND**
    *   Description: Premium Uji matcha powder blended with fresh milk, ice, and sweet whipped cream.

---

## 5. Internal API Specifications

Specifications for the software development team:

*   **Get Menu**: `GET /api/v1/drinks`
    *   *Description*: Returns active drinks, prices, and availability status.
*   **Create Order**: `POST /api/v1/orders`
    *   *Request Body Example*:
        ```json
        {
          "store_id": "ST-999",
          "items": [
            { "drink_id": "BOS-001", "quantity": 2, "options": { "ice": "50%", "sugar": "70%" } }
          ],
          "payment_method": "WALLET"
        }
        ```
*   **Cancel Order**: `POST /api/v1/orders/:order_id/cancel`
    *   *Description*: Cancels an order. The system compares the timestamp of payment confirmation to calculate the appropriate refund percentage (100%, 50%, or 0%).
