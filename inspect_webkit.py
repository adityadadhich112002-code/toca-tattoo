from playwright.sync_api import sync_playwright
import time
import os
import sys

def check_video(file_name, name):
    url = f"http://localhost:9999/public/{file_name}"
    with sync_playwright() as p:
        # Use webkit since WebKit on macOS supports H.264 codec natively
        browser = p.webkit.launch()
        page = browser.new_page()
        page.set_viewport_size({"width": 360, "height": 640})
        
        html = f"""
        <html>
        <body style="margin:0; padding:0; background:black;">
            <video id="vid" src="{url}" style="width:100%; height:100%; object-fit:cover;"></video>
        </body>
        </html>
        """
        page.set_content(html)
        
        # Wait for video metadata
        time.sleep(3.0)
        
        duration = page.evaluate("document.getElementById('vid').duration")
        print(f"Video {name} duration: {duration} seconds")
        
        if not duration or str(duration) == "nan":
            duration = 30.0
            
        # Take screenshot at 90% of the video to see the final result
        ts = duration * 0.9
        page.evaluate(f"document.getElementById('vid').currentTime = {ts}")
        time.sleep(2.0)
        
        out_path = f"/Users/adityadadhich/.gemini/antigravity-ide/brain/d6c671ac-2f01-4461-8325-90b189e3a46d/{name}_end_frame.png"
        page.locator("#vid").screenshot(path=out_path)
        print(f"Saved end frame for {name} to {out_path}")
        browser.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python inspect_webkit.py <file_name> <name>")
        sys.exit(1)
    check_video(sys.argv[1], sys.argv[2])
