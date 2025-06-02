# 🔗 FRAMETALE BACKEND - COMPLETE API DOCUMENTATION

## 📊 **API OVERVIEW**

**Total Services:** 17 enterprise-grade services  
**Total Endpoints:** 90+ RESTful API endpoints  
**Authentication:** JWT Bearer Token  
**Documentation:** Swagger UI at `/api`  
**Base URL:** `http://localhost:3000`

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### Auth Controller (`/auth`)
```
POST /auth/register          - Register new user
POST /auth/login             - Login and get JWT token
```

---

## 👥 **USER MANAGEMENT**

### User Controller (`/users`)
```
GET  /users/profile          - Get current user profile
PUT  /users/profile          - Update current user profile
GET  /users                  - Get all users (Admin only)
GET  /users/:id              - Get user by ID (Admin only)
PUT  /users/:id              - Update user (Admin only)
DELETE /users/:id            - Delete user (Admin only)
```

---

## 📁 **PROJECT MANAGEMENT**

### Project Controller (`/projects`)
```
POST /projects               - Create new project
GET  /projects               - Get user's projects
GET  /projects/public        - Get public projects
GET  /projects/:id           - Get project by ID
PUT  /projects/:id           - Update project
DELETE /projects/:id         - Delete project
PUT  /projects/:id/status    - Update project status
PUT  /projects/:id/images/:imageId    - Add image to project
DELETE /projects/:id/images/:imageId  - Remove image from project
```

---

## 🖼️ **MEDIA MANAGEMENT**

### Media Controller (`/media`)
```
POST /media/upload           - Upload media file
GET  /media                  - Get user's media files
GET  /media/:id              - Get media by ID
GET  /media/:id/download     - Download media file
GET  /media/:id/thumbnail    - Get media thumbnail
PUT  /media/:id/tags         - Update media tags
DELETE /media/:id            - Delete media file
```

---

## 🔍 **IMAGE ANALYSIS & METADATA**

### Metadata Controller (`/metadata`)
```
GET  /metadata/media/:mediaId           - Get media metadata
POST /metadata/analyze/:mediaId         - Analyze media
GET  /metadata/orientation/:orientation - Get by orientation
GET  /metadata/aspect-ratio             - Get by aspect ratio
GET  /metadata/color/:hex               - Get by color
GET  /metadata/quality                  - Get by quality
GET  /metadata/faces                    - Get images with faces
GET  /metadata/layout/:layoutType       - Get by layout type
PUT  /metadata/ai-tags/:mediaId         - Update AI tags
GET  /metadata/statistics               - Get metadata statistics
```

---

## 🎨 **LAYOUT & TEMPLATES**

### Layout Template Controller (`/templates`)
```
POST /templates              - Create template (Admin)
GET  /templates              - Get all templates
GET  /templates/popular      - Get popular templates
GET  /templates/recommended  - Get recommended templates
GET  /templates/categories   - Get template categories
GET  /templates/tags         - Get template tags
GET  /templates/statistics   - Get template statistics
GET  /templates/:id          - Get template by ID
PUT  /templates/:id          - Update template (Admin)
PUT  /templates/:id/usage    - Update template usage
PUT  /templates/:id/rating   - Rate template
DELETE /templates/:id        - Delete template (Admin)
```

### Page Layout Controller (`/page-layout`)
```
POST /page-layout/auto-generate  - Auto-generate layout
POST /page-layout/apply           - Apply layout to project
```

---

## ✨ **AI ENHANCEMENT**

### AI Enhancement Controller (`/ai-enhancement`)
```
POST /ai-enhancement/enhance     - Enhance image
GET  /ai-enhancement/jobs        - Get enhancement jobs
GET  /ai-enhancement/jobs/:jobId - Get job status
DELETE /ai-enhancement/jobs/:jobId - Cancel job
```

---

## 📄 **EXPORT & PRINTING**

### Export Controller (`/export`)
```
POST /export                 - Create export job
GET  /export/jobs            - Get export jobs
GET  /export/jobs/:jobId     - Get export job status
GET  /export/download/:jobId - Download exported file
```

---

## 🛒 **E-COMMERCE**

### Order Controller (`/orders`)
```
POST /orders                 - Create new order
GET  /orders                 - Get user's orders
GET  /orders/statistics      - Get order statistics (Admin)
GET  /orders/:orderId        - Get order details
PUT  /orders/:orderId/cancel - Cancel order
PUT  /orders/:orderId/status - Update order status (Admin)
PUT  /orders/:orderId/tracking - Update tracking info (Admin)
```

---

## 🔔 **NOTIFICATIONS**

### Notification Controller (`/notifications`)
```
GET  /notifications                      - Get user notifications
PUT  /notifications/:notificationId/read - Mark notification as read
PUT  /notifications/mark-all-read        - Mark all as read
DELETE /notifications/:notificationId   - Delete notification
```

---

## 📈 **ANALYTICS & BUSINESS INTELLIGENCE**

### Analytics Controller (`/analytics`)
```
POST /analytics/track        - Track analytics event
GET  /analytics/metrics      - Get analytics metrics (Admin)
GET  /analytics/funnel       - Get funnel analysis (Admin)
GET  /analytics/cohort       - Get cohort analysis (Admin)
GET  /analytics/retention    - Get retention analysis (Admin)
```

**Query Parameters for Metrics:**
- `startDate` - Start date (ISO string)
- `endDate` - End date (ISO string)
- `userId` - Filter by user ID
- `eventType` - Filter by event type
- `category` - Filter by event category

---

## 📋 **REPORTING**

### Reporting Controller (`/reports`)
```
POST /reports                      - Create report (Admin)
GET  /reports                      - Get all reports (Admin)
GET  /reports/:reportId            - Get report details (Admin)
GET  /reports/:reportId/download   - Download report file (Admin)
```

**Report Types:**
- `SALES` - Sales and revenue reports
- `USER_ENGAGEMENT` - User activity reports
- `PRODUCT_PERFORMANCE` - Product analytics
- `FINANCIAL` - Financial summaries
- `OPERATIONAL` - Operational metrics

**Export Formats:**
- `PDF` - Formatted PDF reports
- `CSV` - Comma-separated values
- `EXCEL` - Excel spreadsheets
- `JSON` - JSON data format

---

## ⚖️ **COMPLIANCE & PRIVACY**

### Compliance Controller (`/compliance`)
```
POST /compliance/consent           - Record user consent
POST /compliance/consent/withdraw  - Withdraw consent
POST /compliance/data-request      - Submit data request
GET  /compliance/user/:userId      - Get user compliance data (Admin)
GET  /compliance/my-data           - Get current user compliance data
POST /compliance/retention/schedule - Schedule data retention (Admin)
GET  /compliance/report            - Get compliance report (Admin)
```

**Data Request Types:**
- `access` - Request data access
- `portability` - Request data export
- `deletion` - Request data deletion
- `rectification` - Request data correction

---

## 🌐 **LOCALIZATION**

### Localization Controller (`/localization`)
```
POST /localization/translations    - Create translation (Admin)
GET  /localization/translate/:key  - Get translation
GET  /localization/translations/:language - Get language translations
GET  /localization/languages       - Get supported languages
GET  /localization/namespaces      - Get namespaces
GET  /localization/stats           - Get translation stats (Admin)
GET  /localization/missing/:targetLanguage - Get missing translations (Admin)
POST /localization/import/:language/:namespace - Bulk import (Admin)
GET  /localization/export/:language - Export translations (Admin)
```

**Supported Languages:**
`en`, `es`, `fr`, `de`, `it`, `pt`, `ru`, `zh`, `ja`, `ko`, `ar`, `hi`

---

## ⚙️ **CONFIGURATION & FEATURE FLAGS**

### Configuration Controller (`/configuration`)
```
POST /configuration                - Create configuration (Admin)
GET  /configuration                - Get all configurations (Admin)
GET  /configuration/category/:category - Get by category (Admin)
GET  /configuration/feature/:featureName - Check feature status
GET  /configuration/ab-test/:testName - Get A/B test variant
GET  /configuration/user           - Get user configurations
GET  /configuration/:key           - Get configuration by key
PUT  /configuration/:key           - Update configuration (Admin)
DELETE /configuration/:key         - Delete configuration (Admin)
POST /configuration/bulk-update    - Bulk update configurations (Admin)
```

**Configuration Types:**
- `FEATURE_FLAG` - Feature toggles
- `AB_TEST` - A/B testing variants
- `SYSTEM_SETTING` - System configurations
- `USER_PREFERENCE` - User settings
- `BUSINESS_RULE` - Business logic rules

---

## 🔒 **AUTHENTICATION & AUTHORIZATION**

### Authentication Flow
1. **Register:** `POST /auth/register`
2. **Login:** `POST /auth/login` → Returns JWT token
3. **Use Token:** Include in `Authorization: Bearer <token>` header

### Role-Based Access
- **User Role:** Access to own data and public endpoints
- **Admin Role:** Full access to all endpoints and admin functions

### Protected Endpoints
- All endpoints require authentication except:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /compliance/consent`
  - `GET /localization/translate/:key`
  - `GET /localization/languages`

---

## 📚 **INTERACTIVE DOCUMENTATION**

**Swagger UI:** `http://localhost:3000/api`

The Swagger interface provides:
- ✅ Interactive API testing
- ✅ Request/response examples
- ✅ Schema definitions
- ✅ Authentication testing
- ✅ Real-time API exploration

---

## 🚀 **GETTING STARTED**

1. **Start the server:** `npm run start:dev`
2. **Access Swagger:** `http://localhost:3000/api`
3. **Register a user:** `POST /auth/register`
4. **Login:** `POST /auth/login`
5. **Use JWT token** in Authorization header
6. **Explore APIs** through Swagger UI

**Your Frametale backend is ready with 90+ enterprise-grade API endpoints!** 🎉
