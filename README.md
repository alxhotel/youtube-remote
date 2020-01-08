# youtube-remote

[![NPM Version](https://img.shields.io/npm/v/youtube-remote.svg)](https://www.npmjs.com/package/youtube-remote)
[![Travis Build](https://travis-ci.com/alxhotel/youtube-remote.svg?branch=master)](https://travis-ci.org/alxhotel/youtube-remote)
[![Standard - Javascript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Youtube API wrapper to control your device.

## Installation

```sh
npm install youtube-remote
```

## Usage

```js
const client = new YoutubeRemote(screenId)

// Play a Youtube video by id
client.playVideo('LqYIKYEnX7Y')
```

## API

#### `client = new YoutubeRemote(screenId)`

Start a new remote connection.

`screenId` is the screen identifier of the device you you want to connect to.

#### `client.playVideo(videoId)`

Start a new queue (or playlist) and start playing a new Youtube video.

#### `client.addToQueue(videoId)`

Add a new video to the queue.

#### `client.playNext(videoId)`

Add a new video to the queue just after the current one.

#### `client.removeVideo(videoId)`

Remove a video from the queue.

#### `client.clearPlaylist()`

Clear the current playlist.

## License

MIT. Copyright (c) [Alex](https://github.com/alxhotel)
