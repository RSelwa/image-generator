import * as React from "react"
import YouTube from "react-youtube"
import { getVideoIdFromYoutubeLink } from "@/utils/file"

const YoutubeEmbed = ({ youtubeLink }: { youtubeLink: string }) => {
    const opts = {
        height: "112",
        width: "200",
        playerVars: {
            autoplay: 1,
            controls: 1,
        },
    }

    const videoId = getVideoIdFromYoutubeLink(youtubeLink)

    const onReady = (event: { target: { pauseVideo: () => void } }) => {
        event.target.pauseVideo()
    }

    return <YouTube {...{ opts, videoId }} onReady={onReady} id="video" />
}

export default YoutubeEmbed
