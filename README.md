# dev-kit
Public Release of Guardian Radar Dev-Kit

### Pull Repository
On a Dev-Kit device, navigate to /home/pi/go/src/github.com/GuardianRadar directory and run:
<pre>
git pull https://github.com/GuardianRadar/dev-kit.git
or if device is not set up yet:
git clone https://github.com/GuardianRadar/dev-kit.git
</pre>

### Build and Run
To build the demo from the 'demo' directory execute `go build -o main.exe ./src/...`
To run the demo execute `./main.exe`

### Debugging
Due to the complexity and real time aspect of the radar system (detection communication between everest and pi),
most of the debugging is done with print statements and webpage console outputs. However you can use previous
/ implement debug flags to enable multiple prints at once when debugging.


