-- Check if Google Chrome is running, and if not, launch it
tell application "System Events"
    if not (exists process "Google Chrome") then
        tell application "Google Chrome" to activate
        delay 2
    end if
end tell

-- Get a reference to the Google Chrome application
tell application "Google Chrome"
    set chromeWindows to windows
    set windowList to {}
    set pidList to {}
    
    -- Loop through all open windows and add their titles and process IDs to the lists
    repeat with aWindow in chromeWindows
        set windowTitle to title of aWindow
        set end of windowList to windowTitle
        set end of pidList to id of aWindow
    end repeat
end tell

-- Return the list of window titles and process IDs
return {windowList, pidList}
