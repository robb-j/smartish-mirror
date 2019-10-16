import { ensureData, FaIcon } from '../utils'

function SpotifyTrack(attrs, children) {
  const { current = {} } = attrs

  const isPlaying = current.is_playing
  const hasTrack = current.item

  if (!hasTrack) {
    return (
      <p className="widget-subHeading">
        <FaIcon prefix="fas" iconName="stop" /> Not playing
      </p>
    )
  }

  const trimmedTitle = current.item.name.replace(/\(.+\)/, '')

  return (
    <>
      <p className="widget-subHeading">
        <FaIcon prefix="fas" iconName={isPlaying ? 'music' : 'pause'} />
        {trimmedTitle}
      </p>
      <ul className="widget-list">
        <li className="widget-listItem">– {current.item.album.name}</li>
        <li className="widget-listItem">– {current.item.artists[0].name}</li>
      </ul>
    </>
  )
}

export const Spotify = (widget, data) => {
  const [current, error] = ensureData(data, 'spotify/current')
  if (error) return error

  return (
    <div className="widget-chrome">
      <p className="widget-title">Spotify</p>
      <SpotifyTrack current={current} />
    </div>
  )
}
