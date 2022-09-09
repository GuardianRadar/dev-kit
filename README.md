# dev-kit
Public Release of Guardian Radar Development Kit (Dev-Kit)

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


