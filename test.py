import requests
import json
import os

# ==============================================================================
#  CONFIGURATION
# ==============================================================================
# TODO: Replace with your actual application's domain and a valid dealer ID.
# You can find the dealer ID on the "My Website" dashboard.
BASE_URL = "http://localhost:9002"  # Change this if your app runs on a different port or domain
DEALER_ID = "54c27751-a0a0-47e4-b4a2-1d2616276feb"  # This is a sample ID, replace with a real one from your DB

# ======================================================================

def print_response(name, response):
    """Helper function to print API test results in a formatted way."""
    print(f"--- Testing: {name} ---")
    print(f"URL: {response.url}")
    print(f"Status Code: {response.status_code}")
    try:
        # Try to pretty-print JSON response
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    except json.JSONDecodeError:
        print("Response Text (not JSON):")
        print(response.text)
    print("-" * (len(name) + 16))
    print("\n")


def test_brand_info():
    """Tests the /brand-info endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/brand-info")
        print_response("Get Brand Info", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /brand-info: {e}")

def test_about_us():
    """Tests the /about-us endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/about-us")
        print_response("Get About Us", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /about-us: {e}")

def test_contact():
    """Tests the /contact endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/contact")
        print_response("Get Contact Info", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /contact: {e}")

def test_get_all_products():
    """Tests the /products endpoint and returns the first product ID if available."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/products")
        print_response("Get All Products", response)
        if response.status_code == 200 and response.json():
            products = response.json()
            if isinstance(products, list) and len(products) > 0:
                # Return the ID of the first product
                return products[0].get('id')
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /products: {e}")
    return None

def test_get_single_product(vehicle_id):
    """Tests the /product/:id endpoint."""
    if not vehicle_id:
        print("Skipping single product test: No products found for this dealer.")
        return
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/product/{vehicle_id}")
        print_response(f"Get Single Product (ID: {vehicle_id})", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /product/:id: {e}")

def test_get_messages():
    """Tests the (mocked) /messages endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/messages")
        print_response("Get All Messages (Mocked)", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /messages: {e}")

def test_mark_message_read():
    """Tests the (mocked) POST /message/:id/read endpoint."""
    message_id_to_test = "1"
    try:
        response = requests.post(f"{BASE_URL}/api/website/{DEALER_ID}/message/{message_id_to_test}/read")
        print_response(f"Mark Message as Read (ID: {message_id_to_test}, Mocked)", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /message/:id/read: {e}")

def test_get_themes():
    """Tests the (mocked) /themes endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/themes")
        print_response("Get Available Themes (Mocked)", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /themes: {e}")

def test_apply_theme():
    """Tests the POST /theme/:id/apply endpoint."""
    theme_id_to_apply = "modern"
    try:
        response = requests.post(f"{BASE_URL}/api/website/{DEALER_ID}/theme/{theme_id_to_apply}/apply")
        print_response(f"Apply Theme (ID: {theme_id_to_apply})", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /theme/:id/apply: {e}")


if __name__ == "__main__":
    print("==============================================")
    print("  Starting Trusted Vehicles API Test Suite")
    print("==============================================")
    print(f"Base URL: {BASE_URL}")
    print(f"Dealer ID: {DEALER_ID}\n")

    # Brand / Website Info
    test_brand_info()
    test_about_us()
    test_contact()

    # Products / Services
    # First get all products to find a valid ID for the single product test
    first_product_id = test_get_all_products()
    test_get_single_product(first_product_id)

    # Messages / Notifications
    test_get_messages()
    test_mark_message_read()
    
    # Theme / Template
    test_get_themes()
    test_apply_theme()

    print("==============================================")
    print("  API Test Suite Finished")
    print("==============================================")
