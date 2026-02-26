import * as React from "react"
import { type YouTubeProps } from "react-youtube"
import YouTube from "react-youtube"
import { cn } from "@/utils"
import { getVideoIdFromYoutubeLink } from "@/utils/file"

const YoutubeEmbed = ({ youtubeLink, className, ...props }: { youtubeLink: string, className?: string } & YouTubeProps) => {
    const opts = {
        height: "112",
        width: "200",
        playerVars: {
            autoplay: 1,
            controls: 1,
        },
        ...props.opts,
    }

    const videoId = getVideoIdFromYoutubeLink(youtubeLink)

    const onReady = (event: { target: { pauseVideo: () => void } }) => {
        event.target.pauseVideo()
    }

    return <YouTube {...{ opts, videoId }} onReady={onReady} id="video" className={cn(className)} />
}

export default YoutubeEmbed
