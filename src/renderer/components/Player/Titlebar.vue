<template>
	<div class="titlebar" @mousedown="mouseDown">
		<component :is="platform" :mediaName="mediaName" @fullScreen="fullScreen" />
	</div>
</template>

<script>
import { ipcRenderer, remote } from 'electron'
import Darwin from './Titlebar/Darwin'
import Win32 from './Titlebar/Win32'

export default {
	props: ['mediaName'],
	data () {
		return {
			platform: process.platform,

			pageX: 0,
			pageY: 0,
			isDragging: false
		}
	},
	mounted () {
		this.addEventListeners()
	},
	methods: {
		addEventListeners () {
			document.addEventListener('mousemove', this.mouseMove.bind(this))
			document.addEventListener('mouseup', this.mouseUp.bind(this))
		},
		mouseDown (event) {
			this.isDragging = true

			this.pageX = event.pageX
			this.pageY = event.pageY
		},
		mouseMove (event) {
			if (this.isDragging) {
				const x = event.screenX - this.pageX
				const y = event.screenY - this.pageY

				try {
					remote.BrowserWindow.getFocusedWindow().setPosition(x, y)
				} catch (error) {
					console.error(error)
				}
			}
		},
		mouseUp () {
			this.isDragging = false
		},
		fullScreen (isFullScreen) {
			this.$emit('update:isFullScreen', !isFullScreen)
		}
	},
	components: {
		Darwin,
		Win32
	}
}
</script>

<style>
.titlebar {
	transition: opacity .25s ease-out;
}
.titlebar > div {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 22px;
	z-index: 9999;
	background-color: #202225;
}
</style>