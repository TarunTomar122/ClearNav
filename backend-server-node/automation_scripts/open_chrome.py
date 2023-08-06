import subprocess
import sys

def run_applescript(script_code):
    try:
        # Use osascript to execute the AppleScript code
        subprocess.run(['osascript', '-e', script_code], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error while executing AppleScript: {e}")

target_pid = sys.argv[1]

# AppleScript code to open Google Chrome window with the given PID
applescript_code = f'''
on openChromeWindowWithPID(targetPID)
    tell application "Google Chrome"
        log targetPID
        set windowList to every window
        repeat with aWindow in windowList
            set windowPID to id of aWindow
            set myString to windowPID as text
            log myString
            if myString = targetPID then
                activate
                set index of aWindow to 1
                return
            end if
        end repeat
    end tell
end openChromeWindowWithPID

openChromeWindowWithPID("{target_pid}")
'''

# Call the function to run the AppleScript code
run_applescript(applescript_code)
