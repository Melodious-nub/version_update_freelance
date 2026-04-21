# Comprehensive Test Cases for Dadyin Product Management System

## Table of Contents
1. [Authentication Flow Test Cases](#authentication-flow-test-cases)
2. [Product Template Creation Test Cases](#product-template-creation-test-cases)
3. [M Type Creation Test Cases](#m-type-creation-test-cases)
4. [Product Management Test Cases](#product-management-test-cases)
5. [Order Management Test Cases](#order-management-test-cases)
6. [Business Account Management Test Cases](#business-account-management-test-cases)
7. [Integration Test Cases](#integration-test-cases)
8. [Performance Test Cases](#performance-test-cases)
9. [Security Test Cases](#security-test-cases)

---

## Authentication Flow Test Cases

### TC-AUTH-001: User Registration - Valid Data
**Objective:** Verify successful user registration with valid data
**Preconditions:** User is on the signup page
**Test Steps:**
1. Navigate to `/signup`
2. Fill in valid user details:
   - Email: test@example.com
   - Password: Test123!
   - Confirm Password: Test123!
   - First Name: John
   - Last Name: Doe
   - Business Name: Test Company
3. Select business lines: RETAILER
4. Click "Sign Up"
**Expected Result:** 
- User receives OTP verification email
- Redirected to OTP verification page
- Success message displayed

### TC-AUTH-002: User Registration - Invalid Email
**Objective:** Verify validation for invalid email format
**Test Steps:**
1. Navigate to `/signup`
2. Enter invalid email: "invalid-email"
3. Fill other required fields
4. Click "Sign Up"
**Expected Result:** 
- Email validation error displayed
- Form submission blocked

### TC-AUTH-003: User Registration - Password Mismatch
**Objective:** Verify password confirmation validation
**Test Steps:**
1. Navigate to `/signup`
2. Enter password: "Test123!"
3. Enter confirm password: "Different123!"
4. Fill other required fields
5. Click "Sign Up"
**Expected Result:** 
- Password mismatch error displayed
- Form submission blocked

### TC-AUTH-004: User Registration - Existing Email
**Objective:** Verify handling of duplicate email registration
**Test Steps:**
1. Navigate to `/signup`
2. Enter existing email: existing@example.com
3. Fill other required fields
4. Click "Sign Up"
**Expected Result:** 
- Error message: "User already exist with email"
- Registration blocked

### TC-AUTH-005: OTP Verification - Valid OTP
**Objective:** Verify successful OTP verification
**Preconditions:** User has received OTP email
**Test Steps:**
1. Navigate to `/signup/signup-otp`
2. Enter valid OTP from email
3. Click "Verify"
**Expected Result:** 
- Account activated successfully
- Redirected to home page
- Success message displayed

### TC-AUTH-006: OTP Verification - Invalid OTP
**Objective:** Verify handling of invalid OTP
**Test Steps:**
1. Navigate to `/signup/signup-otp`
2. Enter invalid OTP: "000000"
3. Click "Verify"
**Expected Result:** 
- Error message displayed
- User remains on OTP page

### TC-AUTH-007: User Login - Valid Credentials
**Objective:** Verify successful login with valid credentials
**Preconditions:** User account exists and is verified
**Test Steps:**
1. Navigate to `/signin`
2. Enter valid email: test@example.com
3. Enter valid password: Test123!
4. Click "Sign In"
**Expected Result:** 
- Login successful
- Redirected to home page
- User session established

### TC-AUTH-008: User Login - Invalid Credentials
**Objective:** Verify handling of invalid login credentials
**Test Steps:**
1. Navigate to `/signin`
2. Enter invalid email: wrong@example.com
3. Enter invalid password: WrongPass123!
4. Click "Sign In"
**Expected Result:** 
- Error message: "Invalid credentials"
- User remains on login page

### TC-AUTH-009: Forgot Password - Valid Email
**Objective:** Verify password reset functionality
**Test Steps:**
1. Navigate to `/forgotpassword`
2. Enter valid registered email
3. Click "Send Reset Link"
**Expected Result:** 
- Password reset email sent
- Success message displayed

### TC-AUTH-010: Password Reset - Valid Token
**Objective:** Verify password reset with valid token
**Preconditions:** User has password reset token
**Test Steps:**
1. Navigate to reset password link
2. Enter new password: NewPass123!
3. Confirm new password: NewPass123!
4. Click "Reset Password"
**Expected Result:** 
- Password updated successfully
- Redirected to login page
- Success message displayed

---

## Product Template Creation Test Cases

### TC-PT-001: Create Product Template - Basic Information
**Objective:** Verify creation of product template with basic information
**Preconditions:** User is logged in and has access to product template creation
**Test Steps:**
1. Navigate to `/home/product-management/product-template/add`
2. Fill basic template information:
   - Template Code: TEMP001
   - Template Name: Test Template
   - Description: Test template description
   - Industry Type: Manufacturing
   - Industry Sub Type: Food Processing
3. Click "Next"
**Expected Result:** 
- Basic information saved
- Navigate to next step
- Form validation passed

### TC-PT-002: Create Product Template - Template Calculator
**Objective:** Verify template calculator configuration
**Preconditions:** Basic template information is filled
**Test Steps:**
1. On template calculator step
2. Configure calculator attributes:
   - Add cost attributes
   - Set density values
   - Configure package templates
3. Click "Calculate"
**Expected Result:** 
- Calculator values computed
- Results displayed correctly
- No calculation errors

### TC-PT-003: Create Product Template - Process Configuration
**Objective:** Verify process configuration in template
**Test Steps:**
1. On process configuration step
2. Add process steps:
   - Process Name: Mixing
   - Process Products: Add raw materials
   - Conversion Types: Configure conversions
3. Set process parameters
**Expected Result:** 
- Process added successfully
- Process parameters saved
- Process calculations accurate

### TC-PT-004: Create Product Template - Raw Material Process
**Objective:** Verify raw material process configuration
**Test Steps:**
1. Select "Raw Material" process type
2. Configure raw material process:
   - Add raw materials
   - Set material costs
   - Configure conversion costs
3. Set waste percentages
**Expected Result:** 
- Raw material process configured
- Cost calculations accurate
- Waste calculations correct

### TC-PT-005: Create Product Template - Fixed Process
**Objective:** Verify fixed process configuration
**Test Steps:**
1. Select "Fixed" process type
2. Configure fixed process:
   - Set fixed costs
   - Configure material costs
   - Set conversion costs
3. Validate calculations
**Expected Result:** 
- Fixed process configured
- Fixed costs applied correctly
- Calculations validated

### TC-PT-006: Save Product Template - Draft Mode
**Objective:** Verify saving template in draft mode
**Test Steps:**
1. Complete template configuration
2. Click "Save as Draft"
**Expected Result:** 
- Template saved with DRAFT status
- Success message displayed
- Template available for editing

### TC-PT-007: Publish Product Template
**Objective:** Verify publishing template
**Test Steps:**
1. Complete template configuration
2. Click "Publish"
**Expected Result:** 
- Template saved with PUBLISHED status
- Template available for use
- Success message displayed

### TC-PT-008: Edit Product Template
**Objective:** Verify editing existing template
**Preconditions:** Template exists in draft mode
**Test Steps:**
1. Navigate to template edit page
2. Modify template information
3. Update process configurations
4. Save changes
**Expected Result:** 
- Changes saved successfully
- Template updated
- Success message displayed

### TC-PT-009: Delete Product Template
**Objective:** Verify template deletion
**Preconditions:** Template exists
**Test Steps:**
1. Navigate to template list
2. Click delete on template
3. Confirm deletion
**Expected Result:** 
- Template deleted successfully
- Template removed from list
- Success message displayed

### TC-PT-010: Template Validation - Required Fields
**Objective:** Verify validation of required fields
**Test Steps:**
1. Navigate to template creation
2. Leave required fields empty
3. Try to save
**Expected Result:** 
- Validation errors displayed
- Save blocked
- Required field indicators shown

---

## M Type Creation Test Cases

### TC-MTYPE-001: Create M Type - Basic Information
**Objective:** Verify creation of Master Product Type
**Preconditions:** User has admin privileges
**Test Steps:**
1. Navigate to `/home/product-management/product-type/add`
2. Fill M type information:
   - Product Type Name: Master Type A
   - Description: Master product type description
   - Product Template: Select from available templates
3. Configure product categories
**Expected Result:** 
- M type created successfully
- Created by marked as 'M' (Master)
- Available for product creation

### TC-MTYPE-002: Create M Type - With Sub Types
**Objective:** Verify M type creation with sub types
**Test Steps:**
1. Create M type with basic information
2. Add product sub types:
   - Sub Type 1: Premium
   - Sub Type 2: Standard
   - Sub Type 3: Economy
3. Configure sub type parameters
**Expected Result:** 
- M type created with sub types
- Sub types properly linked
- Hierarchy maintained

### TC-MTYPE-003: Create M Type - Additional Costs
**Objective:** Verify M type with additional cost configuration
**Test Steps:**
1. Create M type
2. Configure additional costs:
   - Packaging Cost
   - Shipping Cost
   - Handling Cost
3. Set cost values and UOMs
**Expected Result:** 
- Additional costs configured
- Cost calculations accurate
- UOM conversions correct

### TC-MTYPE-004: Create M Type - Buying Capacities
**Objective:** Verify buying capacity configuration
**Test Steps:**
1. Create M type
2. Configure buying capacities:
   - SKU level
   - Pallet level
   - Container level
3. Set minimum quantities
**Expected Result:** 
- Buying capacities configured
- Minimum quantities set
- Capacity calculations accurate

### TC-MTYPE-005: Edit M Type
**Objective:** Verify editing M type
**Preconditions:** M type exists
**Test Steps:**
1. Navigate to M type edit page
2. Modify M type information
3. Update sub types
4. Save changes
**Expected Result:** 
- Changes saved successfully
- M type updated
- Sub types updated

### TC-MTYPE-006: Delete M Type
**Objective:** Verify M type deletion
**Preconditions:** M type exists and not in use
**Test Steps:**
1. Navigate to M type list
2. Click delete on M type
3. Confirm deletion
**Expected Result:** 
- M type deleted successfully
- Related sub types handled appropriately
- Success message displayed

### TC-MTYPE-007: M Type Validation - Template Dependency
**Objective:** Verify validation when template is required
**Test Steps:**
1. Create M type without selecting template
2. Try to save
**Expected Result:** 
- Validation error displayed
- Save blocked
- Template selection required

### TC-MTYPE-008: M Type - Division Percentage
**Objective:** Verify division percentage calculation
**Test Steps:**
1. Create M type with sub types
2. Configure division percentages
3. Verify total equals 100%
**Expected Result:** 
- Division percentages validated
- Total equals 100%
- Calculations accurate

### TC-MTYPE-009: M Type - Expense Percentage
**Objective:** Verify expense percentage configuration
**Test Steps:**
1. Create M type
2. Configure expense percentages
3. Set expense categories
**Expected Result:** 
- Expense percentages configured
- Categories properly set
- Calculations validated

### TC-MTYPE-010: M Type - Product Count Tracking
**Objective:** Verify product count tracking
**Preconditions:** M type exists with products
**Test Steps:**
1. View M type details
2. Check product count
3. Verify count accuracy
**Expected Result:** 
- Product count displayed correctly
- Count updates when products added/removed
- Accuracy maintained

---

## Product Management Test Cases

### TC-PROD-001: Create Product - Basic Information
**Objective:** Verify product creation with basic information
**Preconditions:** M types and templates exist
**Test Steps:**
1. Navigate to `/home/product-management/product/add`
2. Fill product basic information:
   - Product Code: PROD001
   - Product Name: Test Product
   - Product Type: Select M type
   - Product Sub Type: Select sub type
3. Configure product meta information
**Expected Result:** 
- Product created successfully
- Basic information saved
- Product code generated

### TC-PROD-002: Create Product - Package Configuration
**Objective:** Verify product package configuration
**Test Steps:**
1. On package configuration step
2. Add product packages:
   - Unit package
   - Box package
   - Pallet package
3. Configure package dimensions and weights
**Expected Result:** 
- Packages configured successfully
- Dimensions and weights saved
- Package hierarchy maintained

### TC-PROD-003: Create Product - Inventory Configuration
**Objective:** Verify inventory configuration
**Test Steps:**
1. Configure inventory settings:
   - Opening inventory
   - Inventory location
   - Inventory tracking
2. Set inventory thresholds
**Expected Result:** 
- Inventory configured successfully
- Thresholds set correctly
- Tracking enabled

### TC-PROD-004: Create Product - Pricing Configuration
**Objective:** Verify pricing configuration
**Test Steps:**
1. Configure product pricing:
   - Base price
   - Tier pricing
   - Discount configurations
2. Set pricing rules
**Expected Result:** 
- Pricing configured successfully
- Tier pricing applied
- Discount rules active

### TC-PROD-005: Create Product - Attribute Configuration
**Objective:** Verify product attribute configuration
**Test Steps:**
1. Configure product attributes:
   - Physical attributes
   - Chemical attributes
   - Custom attributes
2. Set attribute values and UOMs
**Expected Result:** 
- Attributes configured successfully
- Values and UOMs set correctly
- Attribute calculations accurate

### TC-PROD-006: Edit Product
**Objective:** Verify product editing
**Preconditions:** Product exists
**Test Steps:**
1. Navigate to product edit page
2. Modify product information
3. Update configurations
4. Save changes
**Expected Result:** 
- Changes saved successfully
- Product updated
- Configurations updated

### TC-PROD-007: Product List - Search and Filter
**Objective:** Verify product search and filtering
**Test Steps:**
1. Navigate to product list
2. Search by product name
3. Filter by product type
4. Filter by status
**Expected Result:** 
- Search results accurate
- Filters applied correctly
- Results updated dynamically

### TC-PROD-008: Product List - Sorting
**Objective:** Verify product list sorting
**Test Steps:**
1. Navigate to product list
2. Sort by product name
3. Sort by creation date
4. Sort by price
**Expected Result:** 
- Sorting applied correctly
- Results ordered properly
- Sort indicators displayed

### TC-PROD-009: Product - Template Sync
**Objective:** Verify product template synchronization
**Preconditions:** Product linked to template
**Test Steps:**
1. Navigate to product edit page
2. Click "Sync Template"
3. Verify template updates applied
**Expected Result:** 
- Template updates synchronized
- Product attributes updated
- Success message displayed

### TC-PROD-010: Product - Error Validation
**Objective:** Verify product error validation
**Test Steps:**
1. Create product with errors
2. Click "Check for Errors"
3. Review error report
**Expected Result:** 
- Errors identified correctly
- Error report generated
- Issues highlighted

---

## Order Management Test Cases

### TC-ORDER-001: Create RFQ - Basic Information
**Objective:** Verify RFQ creation with basic information
**Preconditions:** User is logged in
**Test Steps:**
1. Navigate to `/home/order-management/rfq/create`
2. Fill RFQ basic information:
   - RFQ Number: Auto-generated
   - Request To: Select vendor
   - Required By Date: Set future date
   - Delivery Location: Enter address
3. Add product requirements
**Expected Result:** 
- RFQ created successfully
- Basic information saved
- RFQ number generated

### TC-ORDER-002: Create RFQ - Product Requirements
**Objective:** Verify product requirements in RFQ
**Test Steps:**
1. Add products to RFQ:
   - Select products from catalog
   - Set quantities
   - Specify delivery requirements
2. Configure product-specific requirements
**Expected Result:** 
- Products added successfully
- Quantities set correctly
- Requirements configured

### TC-ORDER-003: Create RFQ - Terms and Conditions
**Objective:** Verify terms and conditions configuration
**Test Steps:**
1. Configure RFQ terms:
   - Payment terms
   - Delivery terms
   - Quality requirements
2. Add special conditions
**Expected Result:** 
- Terms configured successfully
- Conditions added
- Terms properly documented

### TC-ORDER-004: Send RFQ
**Objective:** Verify RFQ sending functionality
**Preconditions:** RFQ created and configured
**Test Steps:**
1. Review RFQ details
2. Click "Send RFQ"
3. Confirm sending
**Expected Result:** 
- RFQ sent successfully
- Vendors notified
- RFQ status updated

### TC-ORDER-005: Receive Quotation
**Objective:** Verify quotation reception
**Preconditions:** RFQ sent to vendors
**Test Steps:**
1. Navigate to received quotations
2. View quotation details
3. Compare quotations
**Expected Result:** 
- Quotations received and displayed
- Details properly formatted
- Comparison tools available

### TC-ORDER-006: Create Purchase Order
**Objective:** Verify purchase order creation
**Preconditions:** Quotation received and approved
**Test Steps:**
1. Select approved quotation
2. Create purchase order
3. Configure PO details
**Expected Result:** 
- Purchase order created successfully
- PO number generated
- Details configured correctly

### TC-ORDER-007: Order Status Tracking
**Objective:** Verify order status tracking
**Preconditions:** Order exists
**Test Steps:**
1. Navigate to order details
2. Check order status
3. View status history
**Expected Result:** 
- Status displayed correctly
- History maintained
- Updates tracked

### TC-ORDER-008: Order Modification
**Objective:** Verify order modification
**Preconditions:** Order in modifiable status
**Test Steps:**
1. Navigate to order edit page
2. Modify order details
3. Update quantities or products
4. Save changes
**Expected Result:** 
- Changes saved successfully
- Order updated
- Modifications tracked

### TC-ORDER-009: Order Cancellation
**Objective:** Verify order cancellation
**Preconditions:** Order exists and cancellable
**Test Steps:**
1. Navigate to order details
2. Click "Cancel Order"
3. Provide cancellation reason
4. Confirm cancellation
**Expected Result:** 
- Order cancelled successfully
- Cancellation reason recorded
- Status updated

### TC-ORDER-010: Order Reporting
**Objective:** Verify order reporting functionality
**Test Steps:**
1. Navigate to order reports
2. Generate order summary
3. Export order data
**Expected Result:** 
- Reports generated successfully
- Data exported correctly
- Summary accurate

---

## Business Account Management Test Cases

### TC-BA-001: Create Business Account
**Objective:** Verify business account creation
**Preconditions:** User has admin privileges
**Test Steps:**
1. Navigate to business account creation
2. Fill business information:
   - Business Name: Test Business
   - Business Type: Manufacturing
   - Contact Information
   - Address Details
3. Configure business settings
**Expected Result:** 
- Business account created successfully
- Information saved correctly
- Account activated

### TC-BA-002: Business Account - User Management
**Objective:** Verify user management in business account
**Test Steps:**
1. Navigate to user management
2. Add new users
3. Assign roles and permissions
4. Configure user access
**Expected Result:** 
- Users added successfully
- Roles assigned correctly
- Access configured properly

### TC-BA-003: Business Account - Settings Configuration
**Objective:** Verify business account settings
**Test Steps:**
1. Navigate to account settings
2. Configure preferences:
   - Currency settings
   - Language preferences
   - Notification settings
3. Save settings
**Expected Result:** 
- Settings saved successfully
- Preferences applied
- Configuration updated

### TC-BA-004: Business Account - Subscription Management
**Objective:** Verify subscription management
**Test Steps:**
1. Navigate to subscription page
2. View current subscription
3. Upgrade/downgrade subscription
4. Manage payment methods
**Expected Result:** 
- Subscription managed successfully
- Changes applied correctly
- Payment methods updated

### TC-BA-005: Business Account - Data Export
**Objective:** Verify data export functionality
**Test Steps:**
1. Navigate to data management
2. Select data to export
3. Choose export format
4. Generate export
**Expected Result:** 
- Data exported successfully
- Format correct
- Export complete

---

## Integration Test Cases

### TC-INT-001: End-to-End Product Creation Flow
**Objective:** Verify complete product creation workflow
**Test Steps:**
1. Create M type
2. Create product template
3. Create product using template
4. Configure product packages
5. Set up inventory
6. Publish product
**Expected Result:** 
- Complete workflow successful
- All components integrated
- Product ready for use

### TC-INT-002: Order to Fulfillment Flow
**Objective:** Verify complete order processing workflow
**Test Steps:**
1. Create RFQ
2. Receive quotations
3. Create purchase order
4. Process order
5. Update inventory
6. Generate invoice
**Expected Result:** 
- Complete order flow successful
- Inventory updated correctly
- Invoice generated

### TC-INT-003: Template to Product Integration
**Objective:** Verify template integration with products
**Test Steps:**
1. Create product template
2. Create product using template
3. Modify template
4. Sync product with template
5. Verify updates applied
**Expected Result:** 
- Template integration working
- Sync functionality correct
- Updates applied properly

### TC-INT-004: Multi-Business Account Integration
**Objective:** Verify multi-tenant functionality
**Test Steps:**
1. Switch between business accounts
2. Verify data isolation
3. Test cross-account operations
4. Validate permissions
**Expected Result:** 
- Data isolation maintained
- Permissions enforced
- Switching functional

---

## Performance Test Cases

### TC-PERF-001: Large Dataset Handling
**Objective:** Verify performance with large datasets
**Test Steps:**
1. Load 1000+ products
2. Perform search operations
3. Test filtering and sorting
4. Measure response times
**Expected Result:** 
- Response times acceptable
- No performance degradation
- UI remains responsive

### TC-PERF-002: Concurrent User Load
**Objective:** Verify system under concurrent load
**Test Steps:**
1. Simulate 50+ concurrent users
2. Perform various operations
3. Monitor system performance
4. Check for errors
**Expected Result:** 
- System handles load
- No errors or crashes
- Performance maintained

### TC-PERF-003: Template Calculation Performance
**Objective:** Verify template calculation performance
**Test Steps:**
1. Create complex template
2. Perform calculations
3. Measure calculation time
4. Test with multiple processes
**Expected Result:** 
- Calculations complete quickly
- No timeout issues
- Results accurate

---

## Security Test Cases

### TC-SEC-001: Authentication Security
**Objective:** Verify authentication security measures
**Test Steps:**
1. Test password strength requirements
2. Verify session management
3. Test logout functionality
4. Check for session timeout
**Expected Result:** 
- Strong passwords enforced
- Sessions managed securely
- Logout functional
- Timeout working

### TC-SEC-002: Data Access Control
**Objective:** Verify data access control
**Test Steps:**
1. Test user role permissions
2. Verify data isolation
3. Test unauthorized access attempts
4. Check API security
**Expected Result:** 
- Permissions enforced
- Data properly isolated
- Unauthorized access blocked
- API secured

### TC-SEC-003: Input Validation
**Objective:** Verify input validation and sanitization
**Test Steps:**
1. Test SQL injection attempts
2. Test XSS attacks
3. Test file upload security
4. Verify input sanitization
**Expected Result:** 
- Injection attacks blocked
- XSS prevented
- File uploads secure
- Input properly sanitized

---

## Test Data Requirements

### User Accounts
- Admin user with full privileges
- Regular user with limited access
- Test business accounts
- Vendor accounts

### Product Data
- Sample M types
- Product templates
- Test products
- Package configurations

### Order Data
- Sample RFQs
- Test quotations
- Purchase orders
- Invoice data

### Configuration Data
- Business account settings
- User roles and permissions
- System configurations
- Integration settings

---

## Test Environment Setup

### Prerequisites
- Angular development environment
- Backend API server
- Database setup
- Test data seeding

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
- iOS Safari
- Android Chrome
- Responsive design validation

### API Testing
- Postman collections
- Automated API tests
- Performance testing
- Security testing

---

## Test Execution Strategy

### Phase 1: Unit Testing
- Component testing
- Service testing
- Form validation testing
- Utility function testing

### Phase 2: Integration Testing
- API integration testing
- Component integration testing
- End-to-end workflow testing
- Cross-browser testing

### Phase 3: System Testing
- Complete system validation
- Performance testing
- Security testing
- User acceptance testing

### Phase 4: Regression Testing
- Automated regression suite
- Manual regression testing
- Bug fix validation
- Release validation

---

## Defect Management

### Severity Levels
- **Critical:** System crash, data loss, security breach
- **High:** Major functionality broken, workflow blocked
- **Medium:** Minor functionality issues, UI problems
- **Low:** Cosmetic issues, minor improvements

### Test Reporting
- Daily test execution reports
- Defect tracking and status
- Test coverage reports
- Performance metrics

---

## Conclusion

This comprehensive test case document covers all major functionalities of the Dadyin Product Management System. The test cases are designed to ensure:

1. **Complete Coverage:** All user flows and system functionalities
2. **Quality Assurance:** Thorough validation of features
3. **Regression Prevention:** Comprehensive testing to prevent issues
4. **Performance Validation:** System performance under various conditions
5. **Security Verification:** Security measures and data protection

Regular execution of these test cases will ensure the system maintains high quality and reliability while supporting the complex product management workflows required by manufacturing and e-commerce businesses.
