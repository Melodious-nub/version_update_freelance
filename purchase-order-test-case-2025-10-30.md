# How to Test Creating a Purchase Order

**Date:** October 30, 2025  
**What we're testing:** Creating a purchase order with 2 products, including discount, tax, and delivery costs

---

## What This Test Is About

This test shows you how to create a purchase order when you want to:
- Buy 2 different products from a vendor
- Get a discount on your order
- Pay sales tax
- Have the items delivered to you
- Save it as a draft order

---

## Before You Start

Make sure you have:
1. ✅ Logged into the system
2. ✅ Permission to create purchase orders
3. ✅ These vendors set up:
   - Your company (Account ID: 864)
   - The vendor you're buying from: Frontline Export (Account ID: 305)
4. ✅ These products in the system:
   - Rotikaa Laminated Pouch (Product Code: RTL-25R35DR)
   - Garbage Bags - 58 gallon (Product Code: DG-58B451)
5. ✅ Payment terms already set up (Term ID: 2)

---

## What Information We're Entering

### Basic Order Information
- **Order Date**: October 30, 2025
- **I need this by**: November 15, 2025
- **Expected delivery**: December 14, 2025
- **Order expires on**: November 14, 2025
- **Can edit until**: November 6, 2025
- **Order Status**: DRAFT (not submitted yet)
- **Buying Type**: By the box (SKU)
- **Type**: Local order (not international)
- **Delivery**: Yes, deliver to me (not pickup)
- **Shipper Number**: 6789
- **Note**: "just for testing quick note"
- **Loading**: Floor loaded

### Who's Involved
- **I'm ordering from**: Frontline Export (Account ID: 305)
- **My company**: Account ID: 864
- **Contact person**: Not needed for this test

### Money Details
- **Discount**: $15.00 off (14.08% discount)
- **Sales Tax**: 5% tax rate
- **Tax Amount**: $4.58
- **Delivery Cost**: $50.00
- **Payment Terms**: Term #2

### How Much Everything Costs
- **Products cost**: $106.50
- **Discount**: -$15.00
- **Tax**: +$4.58
- **Delivery**: +$50.00
- **TOTAL**: $146.08

### Weight and Size
- **Total Weight**: 26.18 kg (about 58 pounds)
- **Total Size**: 54,266 cubic centimeters
- **Odometer**: 482 (weight measurement)

### The Products We're Buying

#### Product 1: Rotikaa Laminated Pouch
- **Product Code**: RTL-25R35DR
- **What it is**: ROTIKAA LAMINATED 35 Oz - 25 Big Durum Wheat Roti pouches
- **How many boxes**: 1 box
- **How many items in box**: 1,000 pouches
- **Price**: $84.75
- **Weight**: 16.68 kg (about 37 pounds)
- **Size**: 35,396 cubic centimeters

**Product Details:**
- This is a laminated ziplock pouch
- Unit price: $0.055 each
- Box price: $84.62
- Status: Available to order
- Items per box: 1,000 pouches
- Currently in stock: 0

**Volume Discounts (if you buy more)**:
- Buy 1-5 boxes: $110.00 per box
- Buy 6-20 boxes: $85.00 per box  
- Buy 21+ boxes: $76.50 per box

#### Product 2: Garbage Bags
- **Product Code**: DG-58B451
- **What it is**: Garbage Bags - 58 gallon size
- **How many boxes**: 1 box
- **How many bags in box**: 100 bags
- **Price**: $21.75
- **Weight**: 9.5 kg (about 21 pounds)
- **Size**: 18,870 cubic centimeters

**Product Details:**
- Type: 58 gallon garbage bags
- Unit price: $0.156 per bag
- Box price: $21.54
- Status: Available to order
- Items per box: 100 bags
- Currently in stock: 1,150 boxes
- Barcode: 027132995837

**Volume Discounts (if you buy more)**:
- Buy 1-5 boxes: $28.00 per box
- Buy 6-20 boxes: $22.00 per box
- Buy 21+ boxes: $19.50 per box

---

## Step-by-Step Instructions

### Step 1: Open the Create Order Page
1. Log into the system
2. Go to the Purchase Orders section
3. Click "Create New Purchase Order"

### Step 2: Fill Out the Basic Order Info
1. Choose the vendor: **Frontline Export** (Account ID: 305)
2. Make sure your company (Account ID: 864) shows up automatically
3. Enter today's date: **October 30, 2025**
4. Enter when you need this: **November 15, 2025**
5. Enter expected delivery: **December 14, 2025**
6. Enter order expires: **November 14, 2025**
7. Enter can edit until: **November 6, 2025**
8. Choose buying type: **SKU** (buying by the box)
9. Choose order type: **LOCAL** (not international)
10. Choose delivery: **DELIVERY** (not pickup)
11. Enter shipper number: **6789**
12. Add a note: **"just for testing quick note"**
13. Choose loading type: **FLOOR**

### Step 3: Add the First Product (Laminated Pouches)
1. Click "Add Product"
2. Search for product code: **RTL-25R35DR**
3. Make sure it shows: Rotikaa Laminated 35 Oz pouches
4. Set quantity: **1 box**
5. Check that it shows: **1,000 pouches** in the box
6. Check the price shows: **$84.75**
7. Check the weight shows: **16.68 kg**
8. Make sure the product was added to your order

### Step 4: Add the Second Product (Garbage Bags)
1. Click "Add Product" again
2. Search for product code: **DG-58B451**
3. Make sure it shows: Garbage Bag - 58 gallon
4. Set quantity: **1 box**
5. Check that it shows: **100 bags** in the box
6. Check the price shows: **$21.75**
7. Check the weight shows: **9.5 kg**
8. Make sure the product was added to your order

### Step 5: Add the Discount
1. Go to the Discount section
2. Choose discount type: **COST** (dollar amount off)
3. Enter discount: **$15.00**
4. Check that it calculates the percentage: **14.08%**
5. Make sure the discount shows up in your order total

### Step 6: Add Sales Tax
1. Go to the Sales Tax section
2. Choose tax type: **PERCENTAGE**
3. Enter tax rate: **5%**
4. Check that it calculates: **$4.58** tax amount
5. Make sure tax is added after the discount is applied

### Step 7: Add Delivery Cost
1. Go to the Delivery section
2. Make sure "Delivery Cost Input By User" is set to: **No** (system calculates it)
3. Check or enter delivery cost: **$50.00**
4. Make sure delivery cost is added to the total

### Step 8: Set Payment Terms
1. Go to the Payment section
2. Choose **Payment Term ID: 2**
3. Make sure the payment terms are saved

### Step 9: Check the Order Summary
Before saving, double-check everything:
- ✓ **Total products**: 2 items
- ✓ **Product cost**: $106.50
- ✓ **Discount**: $15.00
- ✓ **Tax**: $4.58
- ✓ **Delivery**: $50.00
- ✓ **TOTAL**: $146.08
- ✓ **Total weight**: 26.18 kg
- ✓ **Total size**: 54,266 cm³

### Step 10: Save Your Order
1. Look over everything one more time
2. Click **"Save as Draft"** button
3. Make sure it says the status is: **DRAFT**
4. You should see a success message like "Order saved successfully"
5. Write down the Order ID number (if one is created)

---

## What Should Happen (Expected Results)

### After Saving, You Should See:

**Order Saved Successfully**
- ✓ Your order was created
- ✓ It's saved as a DRAFT (not submitted yet)
- ✓ An order number was created
- ✓ A green success message appears

**All Your Information Was Saved**
- ✓ All the dates you entered are correct
- ✓ Your company and the vendor are saved correctly
- ✓ The order type (Local/Delivery) is saved
- ✓ Your note "just for testing quick note" is saved
- ✓ The shipper number is saved

**Products Are Correct**
- ✓ Both products (pouches and garbage bags) are in the order
- ✓ The quantities (1 box of each) are correct
- ✓ The prices match: $84.75 + $21.75
- ✓ The weights add up: 16.68 kg + 9.5 kg = 26.18 kg

**The Money Math Is Right**
- ✓ Product cost: $106.50 (84.75 + 21.75) ✓
- ✓ Discount taken off: $15.00 ✓
- ✓ After discount: $91.50
- ✓ Tax added (5%): $4.58 ✓
- ✓ Delivery added: $50.00 ✓
- ✓ **Grand Total: $146.08** ✓

**Weight and Size**
- ✓ Total weight: 26.18 kg (both products combined) ✓
- ✓ Total size: 54,266 cubic centimeters ✓

**Everything Else**
- ✓ All product details are saved correctly
- ✓ Nothing got lost or changed
- ✓ You can find this order later to edit or submit

---

## Test Data (JSON Payload)

```json
{
    "shippingDate": null,
    "expiryDate": "2025-11-14",
    "purchaseManagerId": null,
    "purchaseOrderTemplateId": null,
    "totalSku": 2,
    "isUpdated": false,
    "isReceiving": false,
    "customNote": "just for testing quick note",
    "transactionReferenceNumber": null,
    "discountType": "COST",
    "salesTaxType": "PERCENTAGE",
    "audit": null,
    "paymentEnabled": false,
    "id": null,
    "buyingType": "SKU",
    "qoh": null,
    "contactId": null,
    "debugInformation": null,
    "status": "DRAFT",
    "purchaseOrderId": null,
    "saleOrderStatus": null,
    "saleOrderFromId": null,
    "saleOrderToId": null,
    "saleOrderTransactionId": null,
    "transactionId": null,
    "isQuickCheckout": null,
    "remainingPaymentCost": {
        "attributeValue": null,
        "userConversionUom": null
    },
    "media_urls": null,
    "media_url_ids": [],
    "requestFrom": {
        "id": 864
    },
    "requestTo": {
        "id": 305
    },
    "requiredByDate": "2025-11-15",
    "returnDate": null,
    "importLocalType": "LOCAL",
    "referenceContainerId": null,
    "isCreateNewContainer": false,
    "exporterBusinessId": null,
    "deliveryPickup": "DELIVERY",
    "reminderCount": null,
    "odometer": {
        "value": 482,
        "odometerType": "WEIGHT"
    },
    "incoTermId": null,
    "arrivalPortId": null,
    "departurePortId": 8,
    "containerTypeId": null,
    "dadyInPoints": null,
    "containerTypeDescription": null,
    "noteId": null,
    "noteTemplate": null,
    "noteDescription": null,
    "isRead": false,
    "fulfilmentType": null,
    "cost": {
        "attributeValue": 106.5,
        "userConversionUom": "USD"
    },
    "totalCost": {
        "attributeValue": 146.075,
        "userConversionUom": "USD"
    },
    "metricCost": {
        "attributeValue": null,
        "userConversionUom": null
    },
    "weight": {
        "attributeValue": 26.18,
        "userConversionUom": "kg"
    },
    "volume": {
        "attributeValue": 54266,
        "userConversionUom": "cm^3"
    },
    "buddyAccounts": null,
    "productPackages": [
        {
            "id": null,
            "audit": null,
            "skuPackageType": null,
            "isReceiving": false,
            "deliveryDays": null,
            "isCustomized": null,
            "isNoGenericPurchase": null,
            "skuQuantities": 1,
            "unitQuantities": 1000,
            "quantity": 1,
            "qoh": null,
            "loadingType": null,
            "isCostInputByUser": null,
            "cost": {
                "attributeValue": 84.75,
                "userConversionUom": "USD"
            },
            "totalCost": {
                "attributeValue": 84.75,
                "userConversionUom": "USD"
            },
            "weight": {
                "attributeValue": 16.68,
                "userConversionUom": "kg"
            },
            "totalWeight": {
                "attributeValue": 16.68,
                "userConversionUom": "kg"
            },
            "volume": {
                "attributeValue": 35396,
                "userConversionUom": "cm^3"
            },
            "totalVolume": {
                "attributeValue": 35396,
                "userConversionUom": "cm^3"
            },
            "metricCost": {
                "attributeValue": "5080.94",
                "userConversionUom": "USD/mt"
            },
            "productDetails": {
                "id": 2448,
                "productCode": "RTL-25R35DR",
                "description": "ROTIKAA LAMINATED 35 Oz - 25 Big Durum Wheat Roti– Easy-to-Use Open Top with Durable Bottom Seal / 1000 Pcs",
                "skuPackageId": 4429,
                "productId": 2448,
                "packageId": 4429
            },
            "productId": 2448,
            "packageId": 4429
        },
        {
            "id": null,
            "audit": null,
            "skuPackageType": null,
            "isReceiving": false,
            "deliveryDays": null,
            "isCustomized": null,
            "isNoGenericPurchase": null,
            "skuQuantities": 1,
            "unitQuantities": 100,
            "quantity": 1,
            "qoh": null,
            "loadingType": null,
            "isCostInputByUser": null,
            "cost": {
                "attributeValue": 21.75,
                "userConversionUom": "USD"
            },
            "totalCost": {
                "attributeValue": 21.75,
                "userConversionUom": "USD"
            },
            "weight": {
                "attributeValue": 9.5,
                "userConversionUom": "kg"
            },
            "totalWeight": {
                "attributeValue": 9.5,
                "userConversionUom": "kg"
            },
            "volume": {
                "attributeValue": 18870,
                "userConversionUom": "cm^3"
            },
            "totalVolume": {
                "attributeValue": 18870,
                "userConversionUom": "cm^3"
            },
            "metricCost": {
                "attributeValue": "2289.48",
                "userConversionUom": "USD/mt"
            },
            "productDetails": {
                "id": 1403,
                "productCode": "DG-58B451",
                "description": "Garbage Bag - 58 gallon (100 Bags/Box)",
                "skuPackageId": 2132,
                "productId": 1403,
                "packageId": 2132
            },
            "productId": 1403,
            "packageId": 2132
        }
    ],
    "editTillDate": "2025-11-06",
    "expectedByDate": "2025-12-14",
    "date": "2025-10-30",
    "shipper": "6789",
    "quantity": 1,
    "discountCost": {
        "attributeValue": 15,
        "userConversionUom": "USD"
    },
    "discountPercentage": 14.08,
    "salesTaxPercentage": 5,
    "salesTaxCost": {
        "attributeValue": 4.575,
        "userConversionUom": "USD"
    },
    "deliveryCostInputByUser": false,
    "deliveryCost": {
        "attributeValue": 50,
        "userConversionUom": "USD"
    },
    "rfQuotationId": null,
    "contactName": null,
    "contactPhone": null,
    "palletTypeInformation": null,
    "paymentStatus": null,
    "paymentTermId": 2,
    "referenceOrder": {
        "rfQuotationId": null,
        "quotationId": null,
        "purchaseOrderId": null,
        "saleOrderId": null
    },
    "loadingTypeId": "FLOOR"
}
```

---

## Important Things to Remember

### What Makes This Test Special
1. **Two Different Products** - Testing that the system handles orders with multiple products correctly
2. **Money Calculations** - Testing discounts (dollar amount off), tax (percentage), and delivery fees all work together
3. **Local Order** - This is a local delivery order (not international shipping)
4. **Multiple Dates** - Testing that all the different date fields work (order date, need by date, etc.)
5. **Volume Discounts** - Both products have bulk pricing that should be available if you order more
6. **Weight & Size** - Making sure the total weight and size are calculated correctly when you add products

### The Math Should Work Like This:
- Products cost: $84.75 + $21.75 = **$106.50** ✓
- Discount: Take off **$15.00**
- After discount: $106.50 - $15.00 = **$91.50**
- Add tax (5%): $91.50 × 5% = **$4.58** ✓
- Add delivery: **$50.00**
- **Final Total: $146.08** ✓
- Total weight: 16.68 kg + 9.5 kg = **26.18 kg** ✓
- Total size: 35,396 + 18,870 = **54,266 cubic centimeters** ✓

### Things That Are Being Tested:
- ✓ Leaving some fields empty (like contact info) should be okay
- ✓ Ordering different quantities of different products
- ✓ Using a dollar amount discount (not percentage discount)
- ✓ Adding percentage-based tax
- ✓ System calculating delivery cost automatically

---

## If Something Goes Wrong

*(Fill this in when you test it)*

| Issue # | What Happened | How Bad? | Status | Notes |
|---------|---------------|----------|--------|-------|
|         |               |          |        |       |

---

## Test Results Log

| Date Tested | Who Tested It | Did It Pass? | Notes |
|-------------|---------------|--------------|-------|
|             |               |              |       |

---

## Other Related Test Cases
- Creating an order with international shipping (container type)
- Creating an order with just one product
- Creating an order with a percentage discount (instead of dollar amount)
- Editing an existing purchase order

---

## Document History

| Version | Date | Who Made It | What Changed |
|---------|------|-------------|--------------|
| 1.0 | October 30, 2025 | Test Team | First version created |

