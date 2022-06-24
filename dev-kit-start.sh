#!/bin/sh
/home/pi/go/src/github.com/GuardianRadar/dev-kit/core/up_d65.bash
sleep 1

cd /home/pi/go/src/github.com/GuardianRadar/dev-kit/core && sudo ./core &
exit 0