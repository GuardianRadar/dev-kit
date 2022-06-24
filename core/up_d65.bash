#!/bin/bash
# power on AWR1642boost by enabling PMIC on BCM26
# also configures serial pins to be usable

# NRESET output pin
gpio -g mode 22 output
gpio -g write 22 1

# PMIC_EN output pin
gpio -g mode 12 output
# turn on the PMIC
gpio -g write 12 1

# bring out of reset after power is on
gpio -g write 22 0

# verify PMIC is on
if [ "$(gpio -g read 12)" -eq 1 ]
then
	echo "PMIC is up"
else
	echo "error: PMIC did not turn on"
	exit 2
fi

# set mode for RX/TX pins
gpio -g mode 15 ALT5
if [ ! $? -eq 0 ]
then 
	echo "error setting bcm15"
	exit 1
fi
gpio -g mode 15 down
if [ ! $? -eq 0 ]
then 
	echo "error setting bcm15"
	exit 1
fi
gpio -g mode 14 ALT5
if [ ! $? -eq 0 ]
then 
	echo "error setting bcm14"
	exit 1
fi


echo "serial pins configured"
val="$(gpio -g read 14)"
echo "TX value: $val"
val2="$(gpio -g read 15)"
echo "RX value: $val2"

