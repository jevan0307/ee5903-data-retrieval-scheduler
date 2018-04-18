# EE5903 - Simulation of real-time data retrieval scheduler

## Platform - Server and Client
* CPU: 1 core 3.2GHz (VirtualBox)
* Memory: 1GB (VirtualBox)
* Network (limited by wondershaper):
    * 20 Mbps download / 20 Mbps upload
    * 8 Mpbs download / 8 Mbps upload
* OS: Any Linux distribution (Ubuntu Server 16.04 64bit suggested)
* Software Requirement:
    * ifconfig
    * wondershaper
    * Node.js 9.x
    * git
    * OpenSSH Server


## Prerequisite
The simulation requires 4 machines, 1 for server (CCH) and 3 for clients (RC). The following steps help you setup the VMs for the simulation. Since the prerequisite for the 4 machines are the same, you can clone it after one is fully setup.
1. Install [VirtualBox](https://www.virtualbox.org)
2. Download [Ubuntu Server 16.04](https://www.ubuntu.com/download/server)
3. Create 4 virtual machines with Ubuntu Server 16.04
4. Setup ssh server and git
5. Install [Node.js 9](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
6. Create a NAT and configured 4 machines into NAT mode in the same network.

## Bandwidth Limit
In the experiment, we want to emulate the condition when bandwidth resource is limited. We use `wondershaper` to limit the bandwidth.

### Installation
You can download the wondershaper from [Github](https://github.com/magnific0/wondershaper). Do not use package manager to install it.

Following is the command to download wondershaper
```
git clone  https://github.com/magnific0/wondershaper.git
```
This will clone wondershaper in your current folder in a new folder named wondershaper. Now enter the folder using
```
cd wondershaper
```
Before using wondershaper, you should know th name of the network interface. Use `ifconfig` to check the name. For the virtualbox VMs, it should be `enp0s3` by default.

### Bandwidth limit for Server (CCH)
For the server, we limit the download rate and upload rate to `20/20 Mbps`. Here is the following command to do it. Assume the name of the network interface is `enp0s3`:
```
sudo ../wondershaper/wondershaper -a enp0s3 -d 20480 -u 20480
```

### Bandwidth limit for client (RC)
For the client, we limit the download rate and upload rate to `8/8 Mbps`. Here is the following command to do it. Assume the name of the network interface is `enp0s3`:
```
sudo ../wondershaper/wondershaper -a enp0s3 -d 8192 -u 8192
```

### Clear the limitation
You need to clear the configuration before limit with a new one. The following is the command to clear the limitation on interface `enp0s3`:
```
sudo ../wondershaper/wondershaper -c -a enp0s3
```

## Project Sources

This project contains the program for both server(CCH) and clients(RC). The program will create a http server in the host, and you can send the commands through http requests for the simulation. Download this project in both server and client machines, and follow the guides next to setup your simulation.

## Installation
To run the project codes, you need to install the Node.js dependencies first. Execute the following command in the project folder:
```
npm install
```
It will take some times to download the dependencies.

## Configuration
The configuration of is in `./config.json`. In the config file, you can define the name of network interface for bandwidth monitor, and the port for http server in RC and CCH. You can also set the parameters for the scheduler in CCH in this file. See the server section for more information.

## Client (RC)
To run the client program, execute the following command in the project folder:
```
npm run client
```
This program runs a http server in the host. By default, it listens to port 7070. You can change it in the configuration file

### APIs
The client service contains bandwidth monitor API and data retrieval task API. You can use tools like `curl` or `wget` to access these API to run the simulation through HTTP request.

### Heartbeat
Check if the HTTP server is alive
```
GET /alive
```

### Bandwidth Monitor
This API controls the on/off of the bandwidth monitor. You can also get the bandwidth usage logs from this API.
```
GET /bandwidth?action=<action>&interval=<interval>
```
#### Parameters
* `action`<'start'|'stop'|'reset'|'log'>: Action for the bandwidth monitor
    * `start`: Start/Resume monitor the bandwidth usage of network interface defined in the config
    * `stop`: Stop the bandwidth monitor
    * `reset`: Clear the stored log
    * `log`: Get the log of bandwidth monitor. It will respond a JSON with a array of RX, TX and timestamp of the log. RX and TX is the total transmitted bytes of the network interface in MB.
* `interval`<Number>: sampling interval for bandwidth monitor in ms. It is an optional parameter and it would be 1000ms if not provided

### Data Retrieval Task
This API send N data retrieval request simultaneously to the server and responds the status of each request. The willingness to pay of each request is uniformly distributed, it is hard coded in `client/Client.js`.
```
GET /request?ip=<ip>&port=<port>&n=<n>&timeout=<timeout>&size=<size>
```
#### Parameters
* `ip`: The IP of CCH's host
* `port`: The port of CCH's program in the IP specified in `ip`
* `n`<Number>: Number of data retrieval requests
* `timeout`<Number>: Deadline of the request in ms. The connection from client to server will be forced to close after the deadline. The status/logs of the requests will be responded after the deadline
* `size`<Number>: Size of the data retrieved from the server in bytes.


## Server (CCH)
To run the server without the scheduler, execute the following command in the project folder:
```
npm run server
```
This program runs a http server in the host. By default, it listens to port 8080. You can change it in the configuration file

For the server with the scheduler, execute:
```
npm run server:scheduler
```
The parameter `T_0` and `K_{th}` can be set in the config file. The `T_0` is required, and `K_{th}` is optional.

### APIs
The server service contains bandwidth monitor API and data retrieval task API. You can use tools like `curl` or `wget` to access these API to run the simulation through HTTP request.

### Heartbeat
Check if the HTTP server is alive
```
GET /alive
```

### Bandwidth Monitor
This API controls the on/off of the bandwidth monitor. You can also get the bandwidth usage logs from this API.
```
GET /bandwidth?action=<action>&interval=<interval>
```
#### Parameters
* `action`<'start'|'stop'|'reset'|'log'>: Action for the bandwidth monitor
    * `start`: Start/Resume monitor the bandwidth usage of network interface defined in the config
    * `stop`: Stop the bandwidth monitor
    * `reset`: Clear the stored log
    * `log`: Get the log of bandwidth monitor. It will respond a JSON with a array of RX, TX and timestamp of the log. RX and TX is the total transmitted bytes of the network interface in MB.
* `interval`<Number>: sampling interval for bandwidth monitor in ms. It is an optional parameter and it would be 1000ms if not provided

### Data Resource
This API responds request with a specified size of random binary data. For the server with scheduler, the request will be put to the queue and performed the scheduling algorithm.
```
GET /data?size=<size>&price=<price>
```
#### Parameters
* `size`<Number>: The size of the requested data in byte
* `price`<Number>: The willingness to pay for the request. Optional, it would be 0 by default for server with scheduler if it is not provided

## Scripts
There is a script `scripts/SendRequest.js` for the simulation. You can run the script in any other host to send the command to the machines and perform the simulation. The log will be stored in `log/`. In the script, it goes through the following steps:
1. Start bandwidth monitor in server and 3 clients
2. Start data retrieval in 3 clients. The request task contains 3 parallel requests, each request for 5 MB data, and the timeout is set to 20 second.
3. Wait until all the requests are responded or after the timeout period. Write the status of requests to the log file.
4. Get the bandwidth monitor log from server and clients, write the log to the log file.
5. Stop and reset the bandwidth monitor in server and clients.

To run the script, execute the file with Node.js:
```
node ./scripts/SendRequest.js
```
You may want to configure the IP and port of server and clients. They are hard coded in the script, please change the value of variables `serverIP`, `serverPort`, `clientIP`, and `clientPort` by yourself. 
