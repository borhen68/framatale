# 🎨 CANVAS EDITOR ARCHITECTURE - COMPLETE SYSTEM

## 🎯 **YOUR WORKFLOW EXPLAINED**

Perfect! You want to build a **canvas-based editor** where:

1. **Customer selects product size** (8x8, 12x12, etc.)
2. **Templates show up** (designed in Adobe InDesign)
3. **Customer customizes** in your editor
4. **Extra pages/canvases** can be added dynamically
5. **Price updates** automatically with customizations

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **1. Canvas System**
```typescript
// Each product is made of multiple canvases
Photo Book = [Front Cover, Page Spreads, Back Cover]
Calendar = [Cover, 12 Month Pages]
Greeting Card = [Front, Inside Left, Inside Right, Back]
```

### **2. Template System**
```typescript
// Templates created in Adobe InDesign
Template = {
  name: "Wedding Photo Book",
  productType: "PHOTO_BOOK",
  category: "WEDDING",
  canvases: [
    { type: "COVER", elements: [...] },
    { type: "SPREAD", elements: [...] },
    { type: "SPREAD", elements: [...] }
  ],
  indesign: {
    file: "wedding-template.indd",
    version: "CC 2024"
  }
}
```

### **3. Dynamic Canvas Addition**
```typescript
// Customer adds extra pages in editor
await canvasManager.addExtraCanvas(
  projectId: "project123",
  insertAfter: 5,        // Add after page 5
  canvasType: "SPREAD"   // Two-page spread
);

// Price automatically updates
newPrice = basePrice + (extraPages × $1.00)
```

---

## 🎨 **CANVAS STRUCTURE**

### **Canvas Properties:**
```typescript
Canvas = {
  // Basic info
  projectId: "project123",
  productType: "PHOTO_BOOK",
  canvasType: "SPREAD",
  name: "Pages 3-4",
  order: 2,

  // Dimensions (from product size selection)
  dimensions: {
    width: 4800,      // 16x8 inches at 300 DPI (spread)
    height: 2400,     // 8x8 inches at 300 DPI
    unit: "px",
    dpi: 300,
    bleed: 3,         // 3mm bleed for printing
    safeZone: 5,      // 5mm safe zone
    orientation: "landscape"
  },

  // Visual elements
  background: {
    type: "color",
    color: "#ffffff"
  },

  elements: [
    {
      id: "img_001",
      type: "IMAGE",
      position: { x: 100, y: 100, z: 1 },
      size: { width: 800, height: 600 },
      image: {
        url: "/uploads/photo1.jpg",
        crop: { x: 0, y: 0, width: 100, height: 100 },
        filters: { brightness: 110, contrast: 105 }
      }
    },
    {
      id: "text_001", 
      type: "TEXT",
      position: { x: 200, y: 50, z: 2 },
      size: { width: 400, height: 60 },
      text: {
        content: "Our Wedding Day",
        fontFamily: "Playfair Display",
        fontSize: 36,
        color: "#2c3e50"
      }
    }
  ],

  // Template info (if applied)
  template: {
    templateId: "template_wedding_001",
    templateName: "Elegant Wedding",
    appliedAt: "2024-01-15T10:30:00Z",
    customizations: ["text_001_edited", "img_002_added"]
  }
}
```

---

## 📐 **PRODUCT SIZE TO CANVAS MAPPING**

### **Photo Book Sizes:**
```typescript
const photoBookSizes = {
  "8x8": {
    cover: { width: 2400, height: 2400 },    // Single page
    spread: { width: 4800, height: 2400 },   // Two pages
    dpi: 300,
    unit: "px"
  },
  "12x12": {
    cover: { width: 3600, height: 3600 },
    spread: { width: 7200, height: 3600 },
    dpi: 300,
    unit: "px"
  },
  "8x11": {
    cover: { width: 2400, height: 3300 },
    spread: { width: 4800, height: 3300 },
    dpi: 300,
    unit: "px"
  }
};

// When customer selects size
const selectedSize = photoBookSizes["8x8"];
const canvases = await canvasManager.createPhotoBook(
  projectId,
  selectedSize.cover,  // Cover dimensions
  20                   // Default 20 pages
);
```

### **Calendar Sizes:**
```typescript
const calendarSizes = {
  "11x8.5": {
    dimensions: { width: 3300, height: 2550 },
    orientation: "landscape"
  },
  "12x12": {
    dimensions: { width: 3600, height: 3600 },
    orientation: "portrait"
  }
};
```

### **Card Sizes:**
```typescript
const cardSizes = {
  "5x7": {
    dimensions: { width: 1500, height: 2100 },
    orientation: "portrait"
  },
  "4x6": {
    dimensions: { width: 1200, height: 1800 },
    orientation: "portrait"
  }
};
```

---

## 🎨 **TEMPLATE WORKFLOW**

### **1. Adobe InDesign to Template**
```typescript
// Your InDesign workflow
1. Design template in InDesign
2. Export as JSON/XML with element positions
3. Export preview images (thumbnail, full preview, mockup)
4. Upload to template system

// Template creation
const template = await templateManager.createTemplate({
  name: "Elegant Wedding Photo Book",
  productType: "PHOTO_BOOK",
  category: "WEDDING",
  style: "ELEGANT",
  dimensions: {
    width: 2400,
    height: 2400,
    orientation: "portrait",
    pageCount: 20
  },
  canvases: [
    {
      canvasType: "COVER",
      name: "Front Cover",
      elements: [
        {
          type: "IMAGE",
          position: { x: 200, y: 200 },
          size: { width: 2000, height: 1500 },
          isPlaceholder: true,
          placeholderType: "image"
        },
        {
          type: "TEXT", 
          position: { x: 200, y: 1800 },
          size: { width: 2000, height: 200 },
          text: {
            content: "Your Names Here",
            fontSize: 48,
            fontFamily: "Playfair Display",
            color: "#2c3e50"
          },
          isPlaceholder: true,
          placeholderType: "text"
        }
      ]
    }
  ],
  previews: {
    thumbnail: "/templates/wedding-elegant/thumb.jpg",
    preview: "/templates/wedding-elegant/preview.jpg",
    mockup: "/templates/wedding-elegant/mockup.jpg"
  },
  indesign: {
    indesignFile: "/indesign/wedding-elegant.indd",
    indesignVersion: "CC 2024",
    fonts: ["Playfair Display", "Source Sans Pro"]
  }
});
```

### **2. Customer Template Selection**
```typescript
// After customer selects 8x8 photo book
const templates = await templateManager.getTemplatesForProduct(
  "PHOTO_BOOK",
  { width: 2400, height: 2400, orientation: "portrait" },
  { category: "WEDDING", style: "ELEGANT" }
);

// Show templates to customer
templates.forEach(template => {
  displayTemplate({
    name: template.name,
    thumbnail: template.previews.thumbnail,
    preview: template.previews.preview,
    category: template.category,
    difficulty: template.metadata.difficulty,
    estimatedTime: template.metadata.estimatedTime
  });
});
```

### **3. Apply Template to Project**
```typescript
// Customer selects template
const projectCanvases = await canvasManager.createPhotoBook(
  projectId,
  { width: 2400, height: 2400 },
  20,
  "template_wedding_elegant_001"  // Apply template
);

// Each canvas gets template elements as placeholders
projectCanvases.forEach(canvas => {
  canvas.elements.forEach(element => {
    if (element.isPlaceholder) {
      // Show placeholder in editor for customer to replace
      showPlaceholder(element);
    }
  });
});
```

---

## 🔧 **EDITOR INTEGRATION**

### **1. Canvas Rendering**
```javascript
// Frontend editor renders canvas
function renderCanvas(canvas) {
  const stage = new Konva.Stage({
    container: 'canvas-container',
    width: canvas.dimensions.width,
    height: canvas.dimensions.height
  });

  const layer = new Konva.Layer();

  // Render background
  if (canvas.background.type === 'color') {
    const bg = new Konva.Rect({
      width: canvas.dimensions.width,
      height: canvas.dimensions.height,
      fill: canvas.background.color
    });
    layer.add(bg);
  }

  // Render elements
  canvas.elements.forEach(element => {
    switch (element.type) {
      case 'IMAGE':
        renderImageElement(element, layer);
        break;
      case 'TEXT':
        renderTextElement(element, layer);
        break;
      case 'SHAPE':
        renderShapeElement(element, layer);
        break;
    }
  });

  stage.add(layer);
}
```

### **2. Adding Extra Pages**
```javascript
// Customer clicks "Add Page" in editor
async function addExtraPage() {
  const currentPageCount = editor.getPageCount();
  
  // Add canvas on backend
  const newCanvas = await fetch('/canvas/add-extra', {
    method: 'POST',
    body: JSON.stringify({
      projectId: editor.projectId,
      insertAfter: currentPageCount,
      canvasType: 'SPREAD'
    })
  }).then(r => r.json());

  // Update pricing
  const newPricing = await fetch('/pricing/customizations/calculate', {
    method: 'POST',
    body: JSON.stringify({
      productType: 'photo_book',
      basePrice: 22.00,
      customizations: [
        { type: 'EXTRA_PAGES', quantity: 1 }
      ]
    })
  }).then(r => r.json());

  // Update UI
  editor.addCanvas(newCanvas);
  editor.updatePrice(newPricing.totals.totalPrice);
  
  // Show success message
  showNotification(`Page added! New price: $${newPricing.totals.totalPrice}`);
}
```

### **3. Real-Time Element Updates**
```javascript
// Customer drags/edits element
function onElementUpdate(elementId, updates) {
  // Update locally for immediate feedback
  editor.updateElementLocally(elementId, updates);
  
  // Debounced save to backend
  debouncedSave(() => {
    fetch(`/canvas/${canvasId}/elements/${elementId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }, 500);
}

// Customer adds new image
async function addImage(imageFile) {
  // Upload image
  const uploadedImage = await uploadImage(imageFile);
  
  // Add to canvas
  const element = await fetch(`/canvas/${canvasId}/elements`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'IMAGE',
      name: 'Customer Photo',
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      image: { url: uploadedImage.url }
    })
  }).then(r => r.json());

  // Render in editor
  editor.addElement(element);
}
```

---

## 📊 **COMPLETE WORKFLOW EXAMPLE**

### **Customer Journey:**
```typescript
// 1. Customer selects product
const product = "photo_book";
const size = "8x8";

// 2. Show templates for selected size
const templates = await getTemplatesForProduct(product, size);

// 3. Customer selects template
const selectedTemplate = "wedding_elegant";

// 4. Create project with template
const project = await createProject({
  productType: product,
  size: size,
  templateId: selectedTemplate
});

// 5. Customer customizes in editor
// - Replace placeholder images
// - Edit text
// - Add extra pages (+$1 each)
// - Upgrade cover (+$5)

// 6. Real-time pricing updates
const finalPrice = await calculatePrice({
  basePrice: 22.00,
  customizations: [
    { type: 'EXTRA_PAGES', quantity: 5 },
    { type: 'COVER_UPGRADE', quantity: 1 }
  ]
});
// Result: $22 + $5 + $5 = $32

// 7. Customer places order
const order = await createOrder({
  projectId: project.id,
  finalPrice: finalPrice.totals.totalPrice,
  customizations: finalPrice.customizations
});
```

---

## 🎯 **API ENDPOINTS**

### **Canvas Management:**
```
POST /canvas/create                    - Create new canvas
POST /canvas/photo-book               - Create photo book canvases
POST /canvas/calendar                 - Create calendar canvases
POST /canvas/add-extra                - Add extra canvas/page
GET  /canvas/project/:projectId       - Get project canvases
PUT  /canvas/:canvasId/elements/:elementId - Update element
POST /canvas/:canvasId/elements       - Add element
DELETE /canvas/:canvasId/elements/:elementId - Delete element
```

### **Template Management:**
```
GET  /templates/product/:productType  - Get templates for product
GET  /templates/featured              - Get featured templates
GET  /templates/trending              - Get trending templates
GET  /templates/search                - Search templates
POST /templates/create                - Create template (Admin)
GET  /templates/:templateId           - Get template details
POST /templates/:templateId/rate      - Rate template
```

---

## 🎉 **RESULT**

**You now have a complete canvas-based editor system that:**

✅ **Handles multiple product types** (photo books, calendars, cards)  
✅ **Supports Adobe InDesign templates** with placeholders  
✅ **Dynamically adds canvases/pages** with automatic pricing  
✅ **Real-time element editing** with position, size, rotation  
✅ **Template categorization** and search functionality  
✅ **Print-ready output** with bleed and safe zones  
✅ **Scalable architecture** for any print product  

**Your customers can now select sizes, choose templates, customize in your editor, and add extra pages with automatic price updates!** 🚀🎨
