-- Open the Google Chrome window with the given process ID (PID)
on openChromeWindowWithPID(targetPID)
    tell application "Google Chrome"
        set windowList to every window
        repeat with aWindow in windowList
            set windowPID to id of aWindow
            set stringPID to windowPID as text
            log stringPID
            if stringPID = targetPID then
                activate
                set index of aWindow to 1
                return
            end if
        end repeat
    end tell
end openChromeWindowWithPID