#!/bin/zsh

export PATH=$PATH:/usr/local/mysql/bin
mysql --defaults-file=./sql.cfg -Bse "SHOW DATABASES;"

