"""
Smart Bharat Backend API Tests
Tests all backend endpoints using the public URL
"""
import requests
import sys
import time
from datetime import datetime

BASE_URL = "https://bharat-services-3.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = f"test-{int(time.time())}"
        self.tracking_id = None

    def log(self, message, level="INFO"):
        print(f"[{level}] {message}")

    def run_test(self, name, test_fn):
        """Run a single test and track results"""
        self.tests_run += 1
        self.log(f"\n{'='*60}")
        self.log(f"TEST {self.tests_run}: {name}")
        self.log('='*60)
        try:
            test_fn()
            self.tests_passed += 1
            self.log(f"✅ PASSED: {name}", "SUCCESS")
            return True
        except AssertionError as e:
            self.log(f"❌ FAILED: {name} - {str(e)}", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ ERROR: {name} - {type(e).__name__}: {str(e)}", "ERROR")
            return False

    def test_services_list(self):
        """Test GET /api/services returns 8 services"""
        response = requests.get(f"{BASE_URL}/services", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "services" in data, "Response missing 'services' key"
        services = data["services"]
        assert len(services) == 8, f"Expected 8 services, got {len(services)}"
        
        # Check first service has required fields
        service = services[0]
        required_keys = ["key", "name", "name_hi", "apply_url"]
        for key in required_keys:
            assert key in service, f"Service missing required key: {key}"
        
        self.log(f"Found {len(services)} services")
        self.log(f"Sample service: {service['key']} - {service['name']}")

    def test_service_simplify_english(self):
        """Test POST /api/services/simplify with English"""
        payload = {
            "service_key": "pan-card",
            "language": "en"
        }
        response = requests.post(f"{BASE_URL}/services/simplify", json=payload, timeout=60)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "summary" in data, "Response missing 'summary' key"
        assert "service" in data, "Response missing 'service' key"
        
        summary = data["summary"]
        assert "eligibility" in summary, "Summary missing 'eligibility'"
        assert "documents" in summary, "Summary missing 'documents'"
        assert "time_cost" in summary, "Summary missing 'time_cost'"
        
        assert isinstance(summary["eligibility"], list), "eligibility should be a list"
        assert len(summary["eligibility"]) >= 3, f"Expected at least 3 eligibility items, got {len(summary['eligibility'])}"
        
        assert isinstance(summary["documents"], list), "documents should be a list"
        assert len(summary["documents"]) >= 3, f"Expected at least 3 documents, got {len(summary['documents'])}"
        
        time_cost = summary["time_cost"]
        assert "estimated_time" in time_cost, "time_cost missing 'estimated_time'"
        assert "cost" in time_cost, "time_cost missing 'cost'"
        assert "notes" in time_cost, "time_cost missing 'notes'"
        
        self.log(f"Eligibility items: {len(summary['eligibility'])}")
        self.log(f"Documents: {len(summary['documents'])}")
        self.log(f"Time: {time_cost['estimated_time']}, Cost: {time_cost['cost']}")
        self.log(f"Cached: {data.get('cached', False)}")

    def test_service_simplify_cached(self):
        """Test POST /api/services/simplify returns cached result on second call"""
        payload = {
            "service_key": "pan-card",
            "language": "en"
        }
        # First call should cache
        response1 = requests.post(f"{BASE_URL}/services/simplify", json=payload, timeout=60)
        assert response1.status_code == 200, f"Expected 200, got {response1.status_code}"
        
        # Second call should return cached
        response2 = requests.post(f"{BASE_URL}/services/simplify", json=payload, timeout=60)
        assert response2.status_code == 200, f"Expected 200, got {response2.status_code}"
        
        data2 = response2.json()
        assert data2.get("cached") == True, "Second call should return cached:true"
        self.log("✓ Caching working correctly")

    def test_service_simplify_hindi(self):
        """Test POST /api/services/simplify with Hindi language"""
        payload = {
            "service_key": "aadhaar-update",
            "language": "hi"
        }
        response = requests.post(f"{BASE_URL}/services/simplify", json=payload, timeout=60)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        summary = data["summary"]
        
        # Check if response contains Devanagari characters
        eligibility_text = " ".join(summary["eligibility"])
        has_devanagari = any("\u0900" <= ch <= "\u097F" for ch in eligibility_text)
        assert has_devanagari, "Hindi response should contain Devanagari characters"
        
        self.log(f"✓ Hindi response contains Devanagari script")
        self.log(f"Sample eligibility: {summary['eligibility'][0][:50]}...")

    def test_chat_send_streaming(self):
        """Test POST /api/chat/send with SSE streaming"""
        payload = {
            "session_id": self.session_id,
            "message": "How do I apply for a PAN card?",
            "language": "en"
        }
        
        response = requests.post(
            f"{BASE_URL}/chat/send",
            json=payload,
            stream=True,
            timeout=60
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/event-stream" in response.headers.get("content-type", ""), "Expected SSE content-type"
        
        delta_count = 0
        done_received = False
        full_message = None
        
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    import json
                    event_data = json.loads(line_str[6:])
                    
                    if event_data.get("type") == "delta":
                        delta_count += 1
                        assert "text" in event_data, "Delta event missing 'text'"
                    elif event_data.get("type") == "done":
                        done_received = True
                        assert "message" in event_data, "Done event missing 'message'"
                        full_message = event_data["message"]
                        break
        
        assert delta_count > 0, "Expected at least one delta event"
        assert done_received, "Expected 'done' event"
        assert full_message is not None, "Expected full message in done event"
        assert "id" in full_message, "Message missing 'id'"
        assert "role" in full_message, "Message missing 'role'"
        assert full_message["role"] == "assistant", f"Expected role 'assistant', got {full_message['role']}"
        assert "content" in full_message, "Message missing 'content'"
        assert len(full_message["content"]) > 20, "Message content too short"
        
        self.log(f"✓ Received {delta_count} delta events")
        self.log(f"✓ Final message length: {len(full_message['content'])} chars")
        self.log(f"Sample: {full_message['content'][:100]}...")

    def test_chat_history(self):
        """Test GET /api/chat/history/{session_id}"""
        response = requests.get(f"{BASE_URL}/chat/history/{self.session_id}", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "session_id" in data, "Response missing 'session_id'"
        assert "messages" in data, "Response missing 'messages'"
        
        messages = data["messages"]
        assert len(messages) >= 2, f"Expected at least 2 messages (user + assistant), got {len(messages)}"
        
        # Check message structure
        user_msg = messages[0]
        assert user_msg["role"] == "user", f"First message should be user, got {user_msg['role']}"
        assert "content" in user_msg, "Message missing 'content'"
        
        assistant_msg = messages[1]
        assert assistant_msg["role"] == "assistant", f"Second message should be assistant, got {assistant_msg['role']}"
        
        self.log(f"✓ Found {len(messages)} messages in history")

    def test_analyze_image(self):
        """Test POST /api/issues/analyze-image with pothole image"""
        with open("/tmp/pothole.jpg", "rb") as f:
            files = {"file": ("pothole.jpg", f, "image/jpeg")}
            response = requests.post(
                f"{BASE_URL}/issues/analyze-image",
                files=files,
                timeout=60
            )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "image_url" in data, "Response missing 'image_url'"
        assert "analysis" in data, "Response missing 'analysis'"
        
        analysis = data["analysis"]
        assert "category" in analysis, "Analysis missing 'category'"
        assert "severity" in analysis, "Analysis missing 'severity'"
        assert "short_description" in analysis, "Analysis missing 'short_description'"
        assert "confidence" in analysis, "Analysis missing 'confidence'"
        
        # Check category is one of expected values (pothole or damaged_road for pothole image)
        valid_categories = ["pothole", "damaged_road", "water_leakage", "garbage_waste", 
                           "broken_streetlight", "sewage_drainage", "stray_animals", "other"]
        assert analysis["category"] in valid_categories, f"Invalid category: {analysis['category']}"
        
        self.log(f"✓ Detected category: {analysis['category']}")
        self.log(f"✓ Severity: {analysis['severity']}")
        self.log(f"✓ Confidence: {analysis['confidence']}")
        self.log(f"✓ Description: {analysis['short_description']}")
        self.log(f"✓ Image URL: {data['image_url']}")

    def test_create_issue(self):
        """Test POST /api/issues/create"""
        payload = {
            "category": "pothole",
            "severity": "high",
            "description": "Large pothole on main road causing traffic issues",
            "location": "MG Road, Bengaluru",
            "image_url": None,
            "ai_analysis": None
        }
        
        response = requests.post(f"{BASE_URL}/issues/create", json=payload, timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "tracking_id" in data, "Response missing 'tracking_id'"
        assert "issue" in data, "Response missing 'issue'"
        
        tracking_id = data["tracking_id"]
        assert tracking_id.startswith("SB-"), f"Tracking ID should start with 'SB-', got {tracking_id}"
        assert len(tracking_id) == 9, f"Tracking ID should be 9 chars (SB-XXXXXX), got {len(tracking_id)}"
        
        issue = data["issue"]
        assert "timeline" in issue, "Issue missing 'timeline'"
        timeline = issue["timeline"]
        assert len(timeline) == 3, f"Expected 3 timeline stages, got {len(timeline)}"
        
        # Check first stage is completed
        assert timeline[0]["stage"] == "submitted", "First stage should be 'submitted'"
        assert timeline[0]["completed"] == True, "First stage should be completed"
        assert timeline[1]["completed"] == False, "Second stage should not be completed"
        assert timeline[2]["completed"] == False, "Third stage should not be completed"
        
        self.tracking_id = tracking_id
        self.log(f"✓ Created issue with tracking ID: {tracking_id}")
        self.log(f"✓ Timeline has {len(timeline)} stages")

    def test_get_issue(self):
        """Test GET /api/issues/{tracking_id}"""
        assert self.tracking_id is not None, "No tracking ID from previous test"
        
        response = requests.get(f"{BASE_URL}/issues/{self.tracking_id}", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        issue = response.json()
        assert "tracking_id" in issue, "Issue missing 'tracking_id'"
        assert issue["tracking_id"] == self.tracking_id, "Tracking ID mismatch"
        assert "category" in issue, "Issue missing 'category'"
        assert "location" in issue, "Issue missing 'location'"
        assert "timeline" in issue, "Issue missing 'timeline'"
        
        self.log(f"✓ Retrieved issue: {issue['tracking_id']}")
        self.log(f"✓ Category: {issue['category']}, Location: {issue['location']}")

    def test_get_issue_invalid(self):
        """Test GET /api/issues/INVALID1 returns 404"""
        response = requests.get(f"{BASE_URL}/issues/INVALID1", timeout=10)
        assert response.status_code == 404, f"Expected 404 for invalid ID, got {response.status_code}"
        
        data = response.json()
        assert "detail" in data, "Error response missing 'detail'"
        self.log(f"✓ Invalid tracking ID correctly returns 404")

    def run_all_tests(self):
        """Run all tests in sequence"""
        tests = [
            ("GET /api/services - List 8 services", self.test_services_list),
            ("POST /api/services/simplify - English", self.test_service_simplify_english),
            ("POST /api/services/simplify - Caching", self.test_service_simplify_cached),
            ("POST /api/services/simplify - Hindi", self.test_service_simplify_hindi),
            ("POST /api/chat/send - SSE Streaming", self.test_chat_send_streaming),
            ("GET /api/chat/history - Retrieve history", self.test_chat_history),
            ("POST /api/issues/analyze-image - Vision analysis", self.test_analyze_image),
            ("POST /api/issues/create - Create issue", self.test_create_issue),
            ("GET /api/issues/{tracking_id} - Get issue", self.test_get_issue),
            ("GET /api/issues/INVALID1 - 404 for invalid ID", self.test_get_issue_invalid),
        ]
        
        for name, test_fn in tests:
            self.run_test(name, test_fn)
        
        # Print summary
        print("\n" + "="*60)
        print("BACKEND TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*60)
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = BackendTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
