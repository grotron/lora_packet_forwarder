#!/bin/bash
#Scripts to start services if not running
ps -ef | grep nginx |grep -v grep > /dev/null
if [ $? != 0 ]
then
	sudo systemctl start lrgateway.service > /dev/null
fi
