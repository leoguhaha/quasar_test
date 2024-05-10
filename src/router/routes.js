const Video = () => import('src/components/VideoDisplay.vue')
const VideoGrid = () => import('pages/VideoGrid.vue')
const HKVideo = () => import('pages/HKVideo.vue')

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '', component: VideoGrid },
      { path: '/hk', component: HKVideo },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
