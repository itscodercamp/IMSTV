import requests
import json

# ==============================================================================
#  CONFIGURATION
# ==============================================================================
# TODO: Replace with your actual application's domain and a valid dealer ID.
# You can find the dealer ID on the "My Website" dashboard.
BASE_URL = "http://localhost:9002"  # Change this if your app runs on a different port or domain
DEALER_ID = "54c27751-a0a0-47e4-b4a2-1d2616276feb"  # This is a sample ID, replace with a real one from your DB

# You can get a vehicle ID by first running the "Get All Products" test
VEHICLE_ID_TO_TEST = "1" # Replace with a valid vehicle ID from the /products endpoint
# ==============================================================================

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
    """Tests the /products endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/products")
        print_response("Get All Products", response)
    except requests.exceptions.RequestException as e:
        print(f"ERROR calling /products: {e}")

def test_get_single_product():
    """Tests the /product/:id endpoint."""
    if not VEHICLE_ID_TO_TEST:
        print("Skipping single product test: VEHICLE_ID_TO_TEST is not set.")
        return
    try:
        response = requests.get(f"{BASE_URL}/api/website/{DEALER_ID}/product/{VEHICLE_ID_TO_TEST}")
        print_response(f"Get Single Product (ID: {VEHICLE_ID_TO_TEST})", response)
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
    test_get_all_products()
    test_get_single_product()

    # Messages / Notifications
    test_get_messages()
    test_mark_message_read()
    
    # Theme / Template
    test_get_themes()
    test_apply_theme()

    print("==============================================")
    print("  API Test Suite Finished")
    print("==============================================")
