#!/bin/bash

set -e
set -x

## Softether
sudo apt update
sudo apt upgrade -y
sudo apt install build-essential
sudo apt install make
wget -O softether_vpn.tar.gz "https://jp.softether-download.com/files/softether/v4.43-9799-beta-2023.08.31-tree/Linux/SoftEther_VPN_Client/64bit_-_ARM_64bit/softether-vpnclient-v4.43-9799-beta-2023.08.31-linux-arm64-64bit.tar.gz" && tar xzvf softether_vpn.tar.gz
pushd vpnclient/
sudo make
popd
sudo mv vpnclient/ /usr/local
pushd /usr/local/vpnclient/
sudo chmod 600 *
sudo chmod 700 vpncmd
sudo chmod 700 vpnclient
sudo chown root:root *
popd