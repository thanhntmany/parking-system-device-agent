console.log("camera-view-widget")

`<video id="video-player" src="http://0.0.0.0:8001/video" autoplay muted controls style="width: 300px;">`


// link css style
{
    const elm = document.createElement('link')
    elm.setAttribute('rel', 'stylesheet')
    elm.setAttribute('type', 'text/css')
    elm.setAttribute('href', new URL("./style.css", import.meta.url))
    document.head.append(elm)
}

export default createElement = (ops = {}) => {
    const elm = document.createElement('video')
    elm.classList.add("camera-view-widget")
    return elm
}
