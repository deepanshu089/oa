// Fullscreen utility functions

export function requestFullscreen() {
  const element = document.documentElement
  
  if (element.requestFullscreen) {
    return element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    // Safari
    return element.webkitRequestFullscreen()
  } else if (element.msRequestFullscreen) {
    // IE/Edge
    return element.msRequestFullscreen()
  } else if (element.mozRequestFullScreen) {
    // Firefox
    return element.mozRequestFullScreen()
  }
  return Promise.reject('Fullscreen API not supported')
}

export function exitFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    // Safari
    return document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    // IE/Edge
    return document.msExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    // Firefox
    return document.mozCancelFullScreen()
  }
  return Promise.reject('Fullscreen API not supported')
}

export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    document.mozFullScreenElement
  )
}

export function addFullscreenChangeListener(callback) {
  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'msfullscreenchange',
    'mozfullscreenchange'
  ]
  
  events.forEach(event => {
    document.addEventListener(event, callback)
  })
  
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, callback)
    })
  }
}

