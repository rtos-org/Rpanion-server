#!/bin/bash

if timedatectl status | grep -q 'System clock synchronized: yes'; then
    exit 0
else
    exit 1
    fi