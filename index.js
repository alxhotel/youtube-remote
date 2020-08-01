const _ = require('lodash')
const needle = require('needle')

const APP_NAME = 'Youtube'
const YOUTUBE_BASE_URL = 'https://www.youtube.com/'
const BIND_URL = YOUTUBE_BASE_URL + 'api/lounge/bc/bind'
const LOUNGE_TOKEN_URL = YOUTUBE_BASE_URL + 'api/lounge/pairing/get_lounge_token_batch'

const HEADERS = { Origin: YOUTUBE_BASE_URL, 'Content-Type': 'application/x-www-form-urlencoded' }
const LOUNGE_ID_HEADER = 'X-YouTube-LoungeId-Token'
const REQ_PREFIX = 'req'

const S_ID_REGEX = /"c","(.*?)","/
const PLAYLIST_ID_REGEX = /listId":"(.*?)"/
const GSESSION_ID_REGEX = /"S","(.*?)"]/
const NOWPLAYINGVIDEO_ID_REGEX = /videoId":"(.*?)"/
const FIRSTVIDEO_ID_REGEX = /firstVideoId":"(.*?)"/

const CURRENT_INDEX = '_currentIndex'
const CURRENT_TIME = '_currentTime'
const AUDIO_ONLY = '_audioOnly'
const VIDEO_ID = '_videoId'
const LIST_ID = '_listId'
const ACTION = '__sc'
const COUNT = 'count'

const ACTION_SET_PLAYLIST = 'setPlaylist'
const ACTION_CLEAR = 'clearPlaylist'
const ACTION_REMOVE = 'removeVideo'
const ACTION_INSERT = 'insertVideo'
const ACTION_ADD = 'addVideo'

const GSESSIONID = 'gsessionid'
const CVER = 'CVER'
const RID = 'RID'
const SID = 'SID'
const VER = 'VER'

const BIND_DATA = {
  device: 'REMOTE_CONTROL',
  id: '12345678-9ABC-4DEF-0123-0123456789AB',
  name: APP_NAME,
  'mdx-version': 3,
  pairing_type: 'cast',
  app: 'youtube-app'
}

class YoutubeRemote {
  constructor (sessionId) {
    this.screenId = sessionId
    this.loungeToken = null
    this.gSessionId = null
    this.sId = null
    this.rId = 0
    this.reqCount = 0

    this.playlistId = null
    this.nowPlayingId = null
    this.firstVideo = null
  }

  playVideo (videoId, listId, callback) {
    if (typeof listId === 'function') {
      callback = listId
      listId = ''
    }
    if (!callback) callback = noop

    const self = this

    // Create empty queue
    this._startSession(function (err, res) {
      if (err) return callback(err)

      self._initializeQueue(videoId, listId, function (err, res) {
        if (err) return callback(err)
        callback(null, res)
      })
    })
  }

  addToQueue (videoId, callback) {
    this._queueAction(videoId, ACTION_ADD, callback)
  }

  playNext (videoId, callback) {
    this._queueAction(videoId, ACTION_INSERT, callback)
  }

  removeVideo (videoId, callback) {
    this._queueAction(videoId, ACTION_REMOVE, callback)
  }

  clearPlaylist (callback) {
    this._queueAction('', ACTION_CLEAR, callback)
  }

  _inSession () {
    return (this.gSessionId && this.loungeToken)
  }

  _startSession (callback) {
    if (!callback) callback = noop

    const self = this

    self._getLoungeId(function (err, token) {
      if (err) return callback(err)

      self._bind(function (err) {
        if (err) return callback(err)

        callback(null)
      })
    })
  }

  _getLoungeId (callback) {
    if (!callback) callback = noop

    const self = this

    const params = {}
    const data = { screen_ids: this.screenId }

    this._doPost(LOUNGE_TOKEN_URL, params, data, function (err, body) {
      if (err) return callback(err)

      self.loungeToken = _.get(body, 'screens[0].loungeToken', null)
      callback(null, self.loungeToken)
    })
  }

  _bind (callback) {
    if (!callback) callback = noop

    const self = this

    // Reset counters
    this.rId = 0
    this.reqCount = 0

    const params = { [RID]: this.rId, [VER]: 8, [CVER]: 1 }
    const data = BIND_DATA
    const headers = { [LOUNGE_ID_HEADER]: this.loungeToken }

    this._doPost(BIND_URL, params, data, headers, function (err, body) {
      if (err) return callback(err)

      try {
        self.sId = S_ID_REGEX.exec(body)[1]
        self.gSessionId = GSESSION_ID_REGEX.exec(body)[1]
        self.playlistId = PLAYLIST_ID_REGEX.exec(body)[1]
      } catch (err) {
        // Unexpected body
        callback(err)
      }

      try {
        self.firstVideo = FIRSTVIDEO_ID_REGEX.exec(body)[1]
      } catch (err) {
        // Ignore
      }

      try {
        self.nowPlayingId = NOWPLAYINGVIDEO_ID_REGEX.exec(body)[1]
      } catch (err) {
        // Ignore
      }

      callback(null)
    })
  }

  _initializeQueue (videoId, listId = '', callback) {
    if (!callback) callback = noop

    let data = {
      [LIST_ID]: listId,
      [ACTION]: ACTION_SET_PLAYLIST,
      [CURRENT_TIME]: '0',
      [CURRENT_INDEX]: -1,
      [AUDIO_ONLY]: 'false',
      [VIDEO_ID]: videoId,
      [COUNT]: 1
    }

    data = this._formatSessionParams(data)

    const params = { [SID]: this.sId, [GSESSIONID]: this.gSessionId, [RID]: this.rId, [VER]: 8, [CVER]: 1 }
    const headers = { [LOUNGE_ID_HEADER]: this.loungeToken }
    this._doPost(BIND_URL, params, data, headers, true, function (err, body) {
      if (err) return callback(err)
      callback(null, body)
    })
  }

  _queueAction (videoId, action, callback) {
    if (!callback) callback = noop

    const self = this

    if (!this._inSession()) {
      // Start new session
      this._startSession(onSession)
    } else {
      // Re-bind to fix some bugs
      this._bind(onSession)
    }

    function onSession (err, res) {
      if (err) return callback(err)

      let data = { [ACTION]: action, [VIDEO_ID]: videoId, [COUNT]: 1 }
      data = self._formatSessionParams(data)

      const params = { [SID]: self.sId, [GSESSIONID]: self.gSessionId, [RID]: self.rId, [VER]: 8, [CVER]: 1 }
      const headers = { [LOUNGE_ID_HEADER]: self.loungeToken }
      self._doPost(BIND_URL, params, data, headers, function (err, res) {
        if (err) return callback(err)
        callback(null, res)
      })
    }
  }

  _formatSessionParams (params) {
    const reqCount = REQ_PREFIX + this.reqCount
    const res = {}
    for (const key in params) {
      if (key.startsWith('_')) {
        res[reqCount + key] = params[key]
      } else {
        res[key] = params[key]
      }
    }
    return res
  }

  _doPost (url, paramsObj = {}, data = {}, headers = {}, sessionRequest = false, callback) {
    if (typeof headers === 'function') {
      callback = headers
      headers = {}
    } else if (typeof sessionRequest === 'function') {
      callback = sessionRequest
      sessionRequest = false
    }
    if (!callback) callback = noop

    const self = this
    const params = self._getParamString(paramsObj)
    const options = {
      headers: { ...HEADERS, ...headers }
    }

    needle.post(url + '?' + params, data, options, function (err, res) {
      if (err) return callback(err)

      if ((res.statusCode === 404 || res.statusCode === 400) && sessionRequest) {
        self._bind(onDone)
      } else {
        onDone()
      }

      function onDone (err) {
        if (err) return callback(err)

        if (sessionRequest) self.reqCount += 1
        self.rId += 1
        callback(null, res.body)
      }
    })
  }

  _getParamString (obj) {
    var str = ''
    for (const key in obj) {
      if (str !== '') {
        str += '&'
      }
      str += key + '=' + encodeURIComponent(obj[key])
    }
    return str
  }
}

function noop () {}

module.exports = YoutubeRemote
