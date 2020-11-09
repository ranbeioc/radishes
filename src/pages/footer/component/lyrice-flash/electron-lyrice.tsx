import { defineComponent, reactive, toRaw } from 'vue'
import LyriceFlash from './index'
import { Size } from '@/layout/module'
import { Lyrics } from '@/pages/footer/module'
import { LyriceAction, UpdateType } from '@/electron/event/action-types'
import { ErrorBoundary } from '@/components/error-boundary/index'
import { importIpc } from '@/electron/event/ipc-browser'
import { ipcRenderer } from 'electron'

export interface PostData {
  screenSize: Size
  visibleFlash: boolean
  lyrice: Lyrics[]
  index: number
  playing: boolean
  flashMagic: {
    animationDuration: string
  }
}

export const ipcUpdateLyrice = (type: UpdateType, payload?: any) => {
  importIpc().then(event => {
    event.sendAsyncIpcRendererEvent(LyriceAction.LYRICE_UPDATE, {
      type: type,
      payload: toRaw(payload)
    })
  })
}

export default defineComponent({
  name: 'Lyrice',
  setup() {
    const postData: PostData = reactive({
      screenSize: Size.SM,
      visibleFlash: true,
      lyrice: [
        {
          lyric: 'Radishes Music @Link',
          time: 0,
          duration: 0
        }
      ],
      index: 0,
      playing: true,
      flashMagic: {
        animationDuration: ''
      }
    })

    ipcRenderer.on(
      LyriceAction.LYRICE_UPDATE_RENDER,
      (
        event,
        arg: {
          type: UpdateType
          payload: any
        }
      ) => {
        const { type, payload } = arg
        if (payload === undefined) return
        switch (type) {
          case UpdateType.UPDATE_INDEX:
            postData.index = payload
            break
          case UpdateType.UPDATE_LYRICE:
            if (payload.length) {
              postData.lyrice = payload
            }
            break
          case UpdateType.UPDATE_MAGIC:
            postData.flashMagic = payload
            break
          case UpdateType.UPDATE_PLAYING:
            postData.playing = payload
            break
          default:
            break
        }
      }
    )

    return () => (
      <ErrorBoundary ref="ErrorBoundary">
        <LyriceFlash
          screenSize={postData.screenSize}
          visibleFlash={postData.visibleFlash}
          lyrice={postData.lyrice}
          index={postData.index}
          playing={postData.playing}
          flashMagic={postData.flashMagic}
        ></LyriceFlash>
      </ErrorBoundary>
    )
  }
})
