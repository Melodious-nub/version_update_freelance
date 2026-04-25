# Purchase Order UI Automation Testing

This document describes the UI automation testing setup for the Purchase Order component using Playwright.

## Test Structure

### Files Created

1. **Page Object Model**: `models/purchaseOrderSteps.ts`
   - Contains all locators and methods for interacting with the Purchase Order component
   - Includes methods for filling forms, adding products, saving orders, etc.

2. **Test Data**: `testData/purchaseOrder.json`
   - Contains comprehensive test data for purchase orders
   - Includes multiple test scenarios for different order types
   - Based on the provided JSON data structure

3. **Test Suite**: `tests/purchaseOrder.spec.ts`
   - Comprehensive test suite covering all purchase order functionality
   - Includes tests for creating, editing, deleting, and managing purchase orders

4. **Updated Common Page**: `models/common.ts`
   - Added navigation methods for purchase order management
   - Includes methods to navigate to create/edit purchase orders

5. **Updated Helper**: `utils/helper.ts`
   - Added `getPurchaseOrderTestData()` function to load purchase order test data

## Test Scenarios Covered

### 1. Create New Purchase Order - Local Delivery
- Tests creating a new purchase order with local delivery
- Validates form filling and product addition
- Verifies order details and saves as draft

### 2. Create Container Purchase Order
- Tests creating a container-based purchase order
- Includes international shipping fields (Inco Terms, Port of Departure)
- Validates container-specific functionality

### 3. Edit Existing Purchase Order
- Tests editing an existing purchase order
- Validates form updates and product modifications
- Verifies changes are saved correctly

### 4. Place Purchase Order
- Tests the complete order placement flow
- Validates order submission and confirmation

### 5. Use Previous Orders
- Tests loading products from previous orders
- Validates the "Prev. Orders" functionality

### 6. Use My Category Products
- Tests loading products from user's category
- Validates the "My Category" functionality

### 7. Use My Favourite Products
- Tests loading products from user's favourites
- Validates the "My Favourite" functionality

### 8. UOM Settings
- Tests opening and closing UOM settings
- Validates UOM configuration functionality

### 9. Delete Purchase Order
- Tests deleting a purchase order
- Validates deletion confirmation and success message

### 10. Convert Purchase Order to Invoice
- Tests converting a confirmed purchase order to invoice
- Validates conversion process and navigation

### 11. Refresh Purchase Order
- Tests refreshing purchase order data
- Validates data refresh functionality

### 12. Verify Order Totals
- Tests validation of order cost calculations
- Verifies total cost, delivery cost, and other financial fields

### 13. Verify Product Packages
- Tests validation of product package information
- Verifies product count and package details

### 14. Navigate to Payment Tab
- Tests navigation to payment tab for confirmed orders
- Validates payment workflow access

## Test Data Structure

The test data includes:

```json
{
  "purchaseOrder": {
    // Complete purchase order object with all fields
    "id": 820,
    "transactionId": "D_PO00305-000001",
    "buyingType": "SKU",
    "importLocalType": "LOCAL",
    "deliveryPickup": "DELIVERY",
    "requestTo": { "id": 301, "name": "Dayana Polyplast Inc" },
    "productPackages": [
      {
        "id": 1469,
        "quantity": 21,
        "productDetails": {
          "id": 1760,
          "description": "1/6 Black Bags (12 Bottles) 400 Pcs",
          "productCode": "DT-6B254"
        }
      }
    ]
  },
  "testScenarios": [
    {
      "name": "Create New Purchase Order",
      "data": { /* scenario-specific data */ }
    }
  ]
}
```

## Running the Tests

### Prerequisites
1. Ensure the Angular application is running
2. Have valid login credentials configured in environment settings
3. Have test data properly set up

### Command to Run Tests
```bash
# Run all purchase order tests
npx playwright test tests/purchaseOrder.spec.ts

# Run specific test
npx playwright test tests/purchaseOrder.spec.ts -g "Create New Purchase Order"

# Run with headed browser
npx playwright test tests/purchaseOrder.spec.ts --headed

# Run with debug mode
npx playwright test tests/purchaseOrder.spec.ts --debug
```

### Test Configuration
The tests use the existing Playwright configuration in `playwright.config.ts` with:
- Timeout: 90 seconds
- Retry: 2 times on CI, 0 locally
- Screenshots on failure
- Trace on first retry

## Key Features Tested

### Form Interactions
- Vendor selection
- Date field inputs
- Dropdown selections
- Toggle between LOCAL/CONTAINER types
- Product search and selection

### Product Management
- Adding products to orders
- Quantity updates
- Product package management
- Product search from different sources

### Order Operations
- Save as draft
- Place order
- Delete order
- Convert to invoice
- Refresh order data

### Navigation
- Tab navigation (Purchase Order, Payment)
- UOM settings
- Previous orders, My Category, My Favourites

### Validation
- Order totals verification
- Product package verification
- Status verification
- Success message validation

## Maintenance

### Adding New Tests
1. Add new test methods to `purchaseOrder.spec.ts`
2. Update test data in `purchaseOrder.json` if needed
3. Add new locators to `purchaseOrderSteps.ts` if required

### Updating Test Data
1. Modify `testData/purchaseOrder.json`
2. Update test scenarios as needed
3. Ensure data consistency across all scenarios

### Debugging
- Use `--debug` flag for step-by-step debugging
- Check screenshots in `test-results/` directory
- Review traces in `test-results/` directory
- Use `console.log()` statements in test methods for debugging

## Notes

- Tests are designed to be independent and can run in parallel
- Each test includes proper setup and teardown
- Tests use realistic data based on the provided JSON structure
- Error handling and validation are included throughout
- Tests cover both happy path and edge cases
