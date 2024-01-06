; (async () => {
	require('use-strict')
	require('colors')
	require('dotenv').config()
	global.path = require('path')
	global.fs = require('fs')
	global.__root = __dirname
	global.util = require('./lib/util')
	showAppInfo()

	await require('./db')()
	var app = await require('./rest/rest')()
	var httpServer = await require('./lib/http-server')(process.env.HTTP_PORT, app)

	// await require('./wss-api/wss-api')(httpServer)


	setTimeout(() => {
		eventLog(`Application was started properly :-)`.yellow)
		process.env.NODE_ENV == 'development' && console.log(`\nhttp://localhost:${process.env.HTTP_PORT}\n`)

	}, 1000)


	process.env.NODE_ENV != 'development' &&
		process.on('uncaughtException', (err) => {
			errorLog('Caught exception: ', err)
		})
	process.env.NODE_ENV != 'development' &&
		process.on('unhandledRejection', (err) => {
			errorLog('Caught rejection: ', err)
		})
})()

function showAppInfo() {
	let package = require('./package.json')
	// Application info
	console.log('-'.repeat(70))
	console.log('App Name:'.padding(25), package.name.toUpperCase().brightYellow)
	console.log('Version:'.padding(25), package.version.brightGreen)
	console.log('Http Port:'.padding(25), (process.env.HTTP_PORT || '').cyan)
	console.log('Uptime Started:'.padding(25), new Date().yyyymmddhhmmss().white)
	console.log('Copyright:'.padding(25), `2023-Now (c) ${package.author || ''}`.green)
	console.log('NODE_ENV:'.padding(25), (process.env.NODE_ENV || 'production').toUpperCase().cyan)

	console.log('-'.repeat(70))
}
