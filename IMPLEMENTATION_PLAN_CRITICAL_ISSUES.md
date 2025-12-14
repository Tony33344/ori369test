# Critical Issues Implementation Plan - ORI369 Website
**Date:** 2025-11-16  
**Status:** Implementation Roadmap for 4 Critical Issues

---

## Executive Summary

This implementation plan addresses 4 critical issues that are preventing production readiness:

1. **CMS Implementation Chaos** - 5 different CMSManager components causing confusion
2. **Missing Shopping Cart Functionality** - No cart persistence or management  
3. **Security Vulnerabilities** - Rate limiting, auth consistency, CSRF protection
4. **Limited E-commerce Features** - Order history, inventory, discount codes

**Total Estimated Effort:** 6-8 weeks  
**Priority Order:** CMS → Security → Shopping Cart → E-commerce Features

---

## 1. CMS Implementation Chaos 🔴 CRITICAL

### Current State
- **5 different CMSManager components** causing confusion and inconsistency:
  - `components/admin/CMSManager.tsx` - Basic pages/sections model
  - `components/admin/CMSManagerWorking.tsx` - Advanced blocks model with translations  
  - `components/admin/CMSManagerFixed.tsx` - Fixed blocks model with image upload
  - `components/admin/CMSManagerNew.tsx` - New version (unused)
  - `components/admin/CMSManagerSimple.tsx` - Simplified version (unused)
  - `components/admin/CMSManagerWithImages.tsx` - With images (unused)

**Issues Found:**
- Different data models (pages/sections vs pages/blocks)
- Inconsistent API usage patterns
- Multiple admin interfaces confuse users
- Code maintenance nightmare

### Implementation Strategy

**Step 1: Consolidate to Single CMSManager**
```bash
# Files to modify:
- components/admin/CMSManager.tsx (final version)
- app/admin/page.tsx (update import)
- lib/cms.ts (standardize API calls)
```

**Step 2: Migration Strategy**
1. Analyze existing data in both models
2. Create migration script to unify data structure
3. Test migration on staging environment
4. Deploy migration to production

**Step 3: Content Sanitization**
- Add HTML sanitization for all CMS content
- Implement XSS protection
- Add content validation

### Technical Requirements
- **Technologies:** DOMPurify for HTML sanitization, React Hook Form for validation
- **Database:** Migration scripts for data consistency
- **Testing:** Unit tests for CMS operations

### Effort Estimate
- **Analysis:** 1 day
- **Consolidation:** 3 days  
- **Migration:** 2 days
- **Testing:** 2 days
- **Total:** 8 days (2 weeks)

### Priority Order: #1
**Reason:** Foundation issue that affects all other features

### Dependencies
- Database backup before migration
- Admin user approval for interface changes

---

## 2. Security Vulnerabilities 🔴 CRITICAL

### Current State
- **No rate limiting** on any API endpoints
- **Inconsistent authentication** across routes
- **No CSRF protection** implemented
- **Missing input validation** in several endpoints

**Security Gaps Found:**
```javascript
// Missing in ALL API routes:
- rate limiting middleware
- CSRF token validation  
- Input sanitization
- Consistent auth checks
```

### Implementation Strategy

**Step 1: Rate Limiting Implementation**
```typescript
// Files to create/modify:
- lib/middleware/rateLimiter.ts (new)
- app/api/*/route.ts (add rate limiting to all)
```

**Step 2: Authentication Consistency**  
```typescript
// Files to modify:
- lib/auth.ts (standardize auth checks)
- app/api/*/route.ts (consistent middleware usage)
```

**Step 3: CSRF Protection**
```typescript
// Files to create/modify:
- lib/middleware/csrf.ts (new)
- app/layout.tsx (add CSRF tokens)
- forms/ (add CSRF validation)
```

### Technical Requirements
- **Rate Limiting:** express-rate-limit or custom Redis-based solution
- **CSRF Protection:** csurf middleware or next-csrf
- **Input Validation:** zod or joi for all inputs
- **Authentication:** Consistent middleware pattern

### Effort Estimate
- **Rate Limiting:** 2 days
- **Auth Consistency:** 2 days
- **CSRF Protection:** 2 days
- **Testing & Validation:** 2 days
- **Total:** 8 days (2 weeks)

### Priority Order: #2  
**Reason:** Security must be addressed before other features

### Dependencies
- Environment variables for rate limiting storage
- Admin approval for auth changes

---

## 3. Missing Shopping Cart Functionality 🟡 HIGH

### Current State
- **Direct checkout only** - no cart management
- **No cart persistence** across sessions
- **No cart UI** - missing cart page/drawer
- **Single item checkout** only

**Current Flow:** Product Page → Direct Stripe Checkout

**Missing Flow:** Product Page → Add to Cart → Cart Management → Checkout

### Implementation Strategy

**Step 1: Cart Context & State Management**
```typescript
// Files to create:
- contexts/CartContext.tsx (new)
- hooks/useCart.ts (new)
- lib/cart.ts (cart utilities)
```

**Step 2: Cart UI Components**
```typescript
// Files to create:
- components/cart/CartDrawer.tsx (new)
- components/cart/CartPage.tsx (new) 
- components/cart/CartItem.tsx (new)
- components/cart/AddToCartButton.tsx (enhanced)
```

**Step 3: Cart API Endpoints**
```typescript
// Files to create:
- app/api/cart/add/route.ts (new)
- app/api/cart/remove/route.ts (new)  
- app/api/cart/update/route.ts (new)
- app/api/cart/clear/route.ts (new)
```

**Step 4: Cart Persistence**
- Database cart storage
- Guest cart with session ID
- User cart with user ID
- Cart recovery after login

### Technical Requirements
- **State Management:** React Context + localStorage
- **Database:** Cart, cart_items tables  
- **Styling:** Tailwind CSS for cart UI
- **API:** REST endpoints for cart operations

### Effort Estimate
- **Cart System:** 3 days
- **UI Components:** 3 days
- **API Endpoints:** 2 days
- **Integration Testing:** 2 days
- **Total:** 10 days (2.5 weeks)

### Priority Order: #3
**Reason:** Core e-commerce functionality needed for user experience

### Dependencies
- Database schema updates for cart tables
- Integration with existing Stripe checkout

---

## 4. Limited E-commerce Features 🟡 HIGH

### Current State
- **No order history** for users
- **Basic inventory only** - no low stock alerts
- **No discount codes** or promotions
- **No advanced product management**

**Current E-commerce Features:**
- Basic product listings
- Direct checkout via Stripe
- Simple inventory tracking

### Implementation Strategy

**Step 1: Order History System**
```typescript
// Files to create/modify:
- components/account/OrderHistory.tsx (new)
- app/naloga/order-history/page.tsx (new)
- app/api/orders/history/route.ts (new)
```

**Step 2: Inventory Management**
```typescript
// Files to create:
- components/admin/InventoryManager.tsx (new)
- lib/inventory.ts (inventory utilities)
- hooks/useInventory.ts (new)
```

**Step 3: Discount Codes System**
```typescript
// Files to create:
- components/cart/DiscountCode.tsx (new)
- lib/discounts.ts (discount logic)
- app/api/discounts/validate/route.ts (new)
```

**Step 4: Advanced Product Features**
```typescript
// Files to enhance:
- components/admin/ProductsManager.tsx (enhance)
- lib/products.ts (add advanced features)
```

### Technical Requirements
- **Order Management:** Orders, order_items, order_status tables
- **Discount System:** discount_codes, order_discounts tables  
- **Inventory Alerts:** Email notifications for low stock
- **Admin Interface:** Enhanced product management

### Effort Estimate
- **Order History:** 3 days
- **Inventory Management:** 3 days
- **Discount System:** 4 days
- **Advanced Products:** 2 days
- **Testing:** 2 days
- **Total:** 14 days (3.5 weeks)

### Priority Order: #4
**Reason:** Nice-to-have features that enhance user experience

### Dependencies
- Order history requires Stripe webhook integration
- Discount codes need pricing logic updates

---

## Implementation Timeline

### Week 1-2: CMS Consolidation + Security (Critical)
- **Days 1-2:** CMS analysis and planning
- **Days 3-5:** CMS consolidation  
- **Days 6-7:** CMS migration and testing
- **Days 8-10:** Rate limiting implementation
- **Days 11-12:** Auth consistency fixes
- **Days 13-14:** CSRF protection + testing

### Week 3-4: Shopping Cart Implementation  
- **Days 15-17:** Cart context and state management
- **Days 18-20:** Cart UI components
- **Days 21-22:** Cart API endpoints
- **Days 23-24:** Cart persistence and testing

### Week 5-7: E-commerce Features
- **Days 25-27:** Order history system
- **Days 28-30:** Inventory management
- **Days 31-34:** Discount codes system  
- **Days 35-37:** Advanced product features
- **Days 38-42:** Testing and refinements

---

## File Locations Summary

### CMS Consolidation
```
components/admin/CMSManager.tsx (final version)
app/admin/page.tsx (update import)
lib/cms.ts (standardize)
scripts/migrate-cms-data.js (new)
```

### Security Enhancements  
```
lib/middleware/rateLimiter.ts (new)
lib/middleware/csrf.ts (new)
lib/auth.ts (enhance)
app/api/*/route.ts (add security)
```

### Shopping Cart
```
contexts/CartContext.tsx (new)
hooks/useCart.ts (new)
components/cart/* (new directory)
app/cart/page.tsx (new)
app/api/cart/* (new endpoints)
```

### E-commerce Features
```
components/account/OrderHistory.tsx (new)
components/admin/InventoryManager.tsx (new)
components/cart/DiscountCode.tsx (new)
app/naloga/order-history/page.tsx (new)
app/api/orders/* (new endpoints)
app/api/discounts/* (new endpoints)
```

---

## Risk Assessment & Mitigation

### High Risk
- **CMS Data Loss:** Comprehensive backup strategy required
- **Security Breaches:** Staged rollout with security testing
- **Cart Integration:** Test thoroughly with existing Stripe flow

### Medium Risk  
- **Performance Impact:** Monitor API response times during implementation
- **User Confusion:** Gradual rollout with user training

### Mitigation Strategies
- Staging environment testing for all changes
- Feature flags for gradual rollout
- Comprehensive backup and rollback procedures
- User acceptance testing before production

---

## Success Criteria

### CMS Consolidation ✅
- Single CMSManager component in use
- All existing data migrated successfully
- Admin interface streamlined and consistent

### Security Implementation ✅  
- Rate limiting on all API endpoints
- CSRF protection on all forms
- Consistent authentication middleware
- Input validation on all endpoints

### Shopping Cart ✅
- Persistent cart across sessions
- Cart management UI functional
- Integration with existing checkout flow
- Guest and user cart support

### E-commerce Features ✅
- Order history accessible to users
- Inventory management with alerts
- Discount codes functional
- Enhanced product management

---

## Next Steps

1. **Immediate (This Week):** Begin CMS consolidation analysis
2. **Week 2:** Implement security fixes  
3. **Week 3-4:** Develop shopping cart functionality
4. **Week 5-7:** Add e-commerce features
5. **Ongoing:** Testing and refinement

**Projected Go-Live:** 8 weeks from start date

---

*This plan provides a roadmap for transforming the ORI369 website from its current state to a production-ready, secure, and feature-complete e-commerce platform.*