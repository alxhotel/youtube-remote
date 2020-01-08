# youtube-remote

Youtube API wrapper to control your device.

## API

### `client = new YoutubeRemote(screenId)`

Start a new remote connection.

`screenId` is the screen identifier of the device you you want to connect to.

### `client.addToQueue(videoId)`

Add a new video to the queue.

### `client.playNext(videoId)`

Add a new video to the queue just after the current one.

### `client.removeVideo(videoId)`

Remove a video from the queue.

### `client.clearPlaylist()`

Clear the current playlist.

## License

MIT. Copyright (c) [Alex](https://github.com/alxhotel)
