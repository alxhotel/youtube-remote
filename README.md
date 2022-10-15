# youtube-remote

[![NPM Version](https://img.shields.io/npm/v/youtube-remote.svg)](https://www.npmjs.com/package/youtube-remote)
[![Build Status](https://img.shields.io/github/workflow/status/alxhotel/youtube-remote/ci/master)](https://github.com/alxhotel/youtube-remote/actions)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/youtube-remote)](https://libraries.io/npm/youtube-remote)
[![Standard - Javascript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Youtube API wrapper to control your device.

## Installation

```sh
npm install youtube-remote
```

## Usage

```js
const YoutubeRemote = require('youtube-remote')

const client = new YoutubeRemote(screenId)

// Play a Youtube video by id
client.playVideo('LqYIKYEnX7Y', function (err) {
  if (err) return console.log('Error: ', err)
  console.log('Playing video :)')
})
```

## API

#### `client = new YoutubeRemote(screenId)`

Start a new remote connection.

`screenId` is the screen identifier of the device you you want to connect to.

#### `client.playVideo(videoId, [listId, callback])`

Start a new queue (or playlist) and start playing a new Youtube video.

Use `listId` to provide the identifier of a Yotube playlist.

#### `client.addToQueue(videoId, [callback])`

Add a new video to the queue.

#### `client.playNext(videoId, [callback])`

Add a new video to the queue just after the current one.

#### `client.removeVideo(videoId, [callback])`

Remove a video from the queue.

#### `client.clearPlaylist([callback])`

Clear the current playlist.

## License

MIT. Copyright (c) [Alex](https://github.com/alxhotel)
