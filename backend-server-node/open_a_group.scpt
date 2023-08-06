-- open_a_group.scpt

-- Tell application "Google Chrome" to activate the window with the given title
tell application "Google Chrome"
    set windowList to every window
    repeat with aWindow in windowList
        set windowTitleText to title of aWindow
        if windowTitleText contains targetWindowTitle then
            activate
            set index of aWindow to 1
            return
        end if
    end repeat
end tell
