import requests
import time
import sys

BACKEND_URL = "https://tradingpool-backend.onrender.com/health"
FRONTEND_URL = "https://tradingpool-frontend.onrender.com"
LOGIN_URL = "https://tradingpool-backend.onrender.com/api/v1/auth/login"

print("--- STARTING RIGOROUS DEPLOYMENT VERIFICATION ---")

def check_backend():
    print(f"\n[1/3] Polling Backend Health at {BACKEND_URL}...")
    print("      (Note: Render Free Tier pauses services. Expecting 30-60s Cold Start delay...)")
    
    start_time = time.time()
    max_wait = 400  # Wait up to ~7 minutes for build + cold start
    
    while time.time() - start_time < max_wait:
        try:
            # High timeout to allow for cold start waking up
            response = requests.get(BACKEND_URL, timeout=45)
            if response.status_code == 200:
                print(f"      ✅ Backend SUCCESS! Response: {response.text}")
                return True
            else:
                print(f"      Status {response.status_code}. Retrying...")
        except requests.exceptions.ReadTimeout:
            print("      ⏳ Timeout (Cold Start in progress)... Retrying...")
        except requests.exceptions.ConnectionError:
            print("      ❌ Connection Error (Service might be deploying)... Retrying...")
        except Exception as e:
            print(f"      Error: {e}. Retrying...")
        
        time.sleep(10)
    
    print("      ❌ BACKEND FAILED TO RESPOND after 7 minutes.")
    return False

def check_admin_login():
    print(f"\n[2/3] Testing Admin Login...")
    payload = {"email": "sesshomaru@admin.com", "password": "inyasha"}
    try:
        response = requests.post(LOGIN_URL, json=payload, timeout=10)
        if response.status_code == 201 or response.status_code == 200:
            if "access_token" in response.text:
                print("      ✅ Login SUCCESS! Token received.")
                return True
            else:
                print(f"      ❌ Login returned 200/201 but no token: {response.text}")
        else:
             print(f"      ❌ Login Failed via API. Status: {response.status_code}. Response: {response.text}")
    except Exception as e:
        print(f"      ❌ Login Exception: {e}")
    return False

def check_frontend():
    print(f"\n[3/3] Checking Frontend Availability at {FRONTEND_URL}...")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            print(f"      ✅ Frontend is LIVE (Status 200).")
            # We can't easily check CSS classes via raw requests, but we know it loaded.
            return True
        else:
            print(f"      ❌ Frontend returned status: {response.status_code}")
    except Exception as e:
        print(f"      ❌ Frontend unreachable: {e}")
    return False

# EXECUTE
if check_backend():
    login_ok = check_admin_login()
    front_ok = check_frontend()
    
    if login_ok and front_ok:
        print("\n✅✅✅ DEPLOYMENT VERIFIED AND FULLY FUNCTIONAL.")
        sys.exit(0)
    else:
        print("\n⚠️ PARTIAL SUCCESS: Backend is up, but checks failed.")
        sys.exit(1)
else:
    print("\n❌ CRITICAL FAILURE: Backend did not wake up.")
    sys.exit(1)
