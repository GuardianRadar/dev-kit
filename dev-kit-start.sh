#!/bin/sh
/home/pi/go/src/github.com/GuardianRadar/dev-kit/up_d65.bash
sleep 1

cd /home/pi/go/src/github.com/GuardianRadar/dev-kit && sudo ./core &
exit 0