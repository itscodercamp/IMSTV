# Trusted Vehicles - Dealer Website API Documentation

This document provides the details for the public API endpoints available to each dealer for their personal website. These APIs allow for programmatic access to website content, products, and user interactions.

## Base URL

All API endpoints share the following base URL structure:

`https://<your-app-domain>/api/website/[dealerId]`

Replace `<your-app-domain>` with your application's domain and `[dealerId]` with the specific ID of the dealer whose data you wish to access.

---

## 1. Brand / Website Info

Endpoints related to the dealer's brand and general website information.

### Get Brand Info
- **Endpoint**: `/brand-info`
- **Method**: `GET`
- **Description**: Retrieves the main branding information for the website.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/brand-info`
- **Success Response (200 OK)**:
  ```json
  {
    "brandName": "Sharma Motors",
    "logoUrl": "https://example.com/logo.png",
    "tagline": "Your trusted partner for used cars."
  }
  ```

### Get About Us Content
- **Endpoint**: `/about-us`
- **Method**: `GET`
- **Description**: Retrieves the 'About Us' content for the website.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/about-us`
- **Success Response (200 OK)**:
  ```json
  {
    "aboutUs": "Serving our community for over 20 years, Sharma Motors offers the best quality pre-owned vehicles..."
  }
  ```

### Get Contact Info
- **Endpoint**: `/contact`
- **Method**: `GET`
- **Description**: Retrieves the public contact details for the dealership.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/contact`
- **Success Response (200 OK)**:
  ```json
  {
    "phone": "9876543210",
    "email": "contact@sharmamotors.com",
    "address": "123, MG Road, Pune, Maharashtra"
  }
  ```

---

## 2. Products / Services

Endpoints for accessing vehicle inventory.

### Get All Products
- **Endpoint**: `/products`
- **Method**: `GET`
- **Description**: Returns a list of all vehicles currently marked as "For Sale" in the dealer's inventory.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/products`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "vehicle-id-1",
      "make": "Maruti Suzuki",
      "model": "Swift",
      "year": 2022,
      "price": 550000,
      "images": { "exterior": { "front": "https://example.com/swift.png" } }
      // ... other vehicle fields
    },
    {
      "id": "vehicle-id-2",
      "make": "Hyundai",
      "model": "i20",
      "year": 2021,
      "price": 620000,
      "images": { "exterior": { "front": "https://example.com/i20.png" } }
      // ... other vehicle fields
    }
  ]
  ```

### Get Single Product Details
- **Endpoint**: `/product/[vehicleId]`
- **Method**: `GET`
- **Description**: Retrieves detailed information for a single vehicle. The vehicle must be "For Sale".
- **Parameters**:
  - `vehicleId` (string): The unique ID of the vehicle.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/product/vehicle-id-1`
- **Success Response (200 OK)**:
  ```json
  {
    "id": "vehicle-id-1",
    "make": "Maruti Suzuki",
    "model": "Swift",
    // ... all other vehicle fields
  }
  ```

---

## 3. Messages / Notifications

Endpoints for managing user messages received through the website. (Note: These are currently mock endpoints).

### Get All Messages
- **Endpoint**: `/messages`
- **Method**: `GET`
- **Description**: Retrieves a list of all contact messages from the website.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/messages`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Kavita Iyer",
      "email": "kavita@example.com",
      "phone": "8765432109",
      "message": "Interested in the Swift. Is it available for a test drive tomorrow?",
      "receivedAt": "2024-01-01T12:00:00Z",
      "isRead": false
    }
  ]
  ```

### Mark Message as Read
- **Endpoint**: `/message/[messageId]/read`
- **Method**: `POST`
- **Description**: Marks a specific message as read.
- **Parameters**:
  - `messageId` (string): The ID of the message to mark as read.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/message/1/read`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Message 1 marked as read."
  }
  ```

---

## 4. Theme / Template

Endpoints for managing the website's visual theme. (Note: These are currently mock endpoints).

### Get Available Themes
- **Endpoint**: `/themes`
- **Method**: `GET`
- **Description**: Retrieves a list of available themes for the website.
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/themes`
- **Success Response (200 OK)**:
  ```json
  [
    { "id": "modern", "name": "Modern", "previewUrl": "..." },
    { "id": "classic", "name": "Classic", "previewUrl": "..." }
  ]
  ```

### Apply a Theme
- **Endpoint**: `/theme/[themeId]/apply`
- **Method**: `POST`
- **Description**: Applies a selected theme to the website.
- **Parameters**:
  - `themeId` (string): The ID of the theme to apply (e.g., "modern").
- **Example URL**: `https://<your-app-domain>/api/website/some-dealer-id/theme/modern/apply`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Theme 'modern' applied successfully."
  }
  ```
