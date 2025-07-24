Set WshShell = WScript.CreateObject("WScript.Shell")
Set oUrlLink = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") & "\Al-Aseel Commercial Complex.lnk")

oUrlLink.TargetPath = "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\launch-project.bat"
oUrlLink.WorkingDirectory = "c:\Users\ssssh\OneDrive\Documents\AlAseelComm"
oUrlLink.Description = "Launch Al-Aseel Commercial Complex Website"
oUrlLink.IconLocation = "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\images\AlaseelcommAdv.png"
oUrlLink.Save

WScript.Echo "Desktop shortcut created successfully!"
WScript.Echo "You can now find 'Al-Aseel Commercial Complex' shortcut on your desktop."
