import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer"

type Props = {
  canvasBackground?: string
  src: string
  height?: string
  width?: string
}

export const ReactSphere = ({
  src,
  canvasBackground,
  height = "100%",
  width = "100%",
}: Props) => {
  const proxySrc = `/api/proxy-image?url=${encodeURIComponent(src)}`

  return (
    <ReactPhotoSphereViewer
      hideNavbarButton={true}
      navbar={false}
      canvasBackground={canvasBackground}
      src={proxySrc}
      height={height}
      width={width}
    />
  )
}
