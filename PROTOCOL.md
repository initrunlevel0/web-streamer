# web-streamer protocol

## Description

The web-streamer is a software platform that purposely used in classroom situation to play a video/audio stream where the played content are controlled by a single teacher. When a teacher choose one media file to be play with, it will be streamed (hopefully in the synchronous way) to all of students within a classroom.

## Platform

* Node.js as the web server programming platform
* Socket.io (A Node.js library) as full-duplex server-client communication
* FFMPEG as video/audio transconder: Tranconding to .webm based video
* Angular.js

## Interface

There are two interfaces :
* Server who control what is played.
* Clien who watch the stream itself.


## Protocol

This protocol definition will define how the Socket.io will conduct the communication between all clients.

### Server’s Socket.io event

#### Server Web Interface

* emit:PlayStream
    * Emitted when a teacher choose to play a single media file.


#### Server’s Backend Interface

* on:PlayStream
    * The backend of server then proceed to emit playStreamAsClient to all client by telling the client which media file will be played
* emit: playStreamAsClient


#### Client’s Socket.io event

* on:playStreamAsClient
    * Change the HTML5 player source to new stream

### Server HTTP route 

* GET /login
* POST /login
    * username
    * password
* GET /server [After login]
* GET /listfile [After login]
    * ?q=<location>
* GET /media/: Tranconder conducted here
    * ?q=<location>
* GET /client

