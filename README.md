# dev-kit
Public Release of Global Radar Tech Development Kit (Dev-Kit)
https://docs.google.com/document/d/1g76m10xMhK-Oy6TLJ-gVBf1AaDJxTd4Ku1AU6WMGdV4/edit?usp=sharing


### Pull Repository
On a Dev-Kit device, navigate to /home/pi/go/src/github.com/GuardianRadar/dev-kit directory and run:
<pre>
git pull origin main
//can switch out main for any other branch
</pre>

or if device is not set up yet, navigate to /home/pi/go/src/github.com/GuardianRadar directory and run:
<pre>
git clone https://github.com/GuardianRadar/dev-kit.git
</pre>

### Build and Run
To build the demo from the 'demo' directory execute `go build -o main.exe ./src/...`
To run the demo execute `./main.exe`

### Debugging
Due to the complexity and real time aspect of the radar system (detection communication between boards),
most debugging is easiest done with print statements and/or webpage console outputs.


