import esbuild from 'esbuild'

buildAll()

async function buildAll() {
	return Promise.all([
		build('esm', {
			entryPoints: ['src/clampwind.js'],
			platform: 'node',
			format: 'esm',
			mainFields: ['module', 'main'],
		}),
		build('cjs', {
			entryPoints: ['src/clampwind.js'],
			target: ['node20.16'],
			platform: 'node',
			format: 'cjs',
		}),
	])
}

async function build(name, options) {
	const path = `clampwind.${name}.${name === 'cjs' ? 'cjs' : 'js'}`
	console.log(`Building ${name}`)

	if (process.argv.includes('--watch')) {
		let ctx = await esbuild.context({
			outfile: `./dist/${path}`,
			bundle: true,
			logLevel: 'info',
			sourcemap: true,
      minify: false,
			...options,
		})
		await ctx.watch()
	}
	else {
		return esbuild.build({
			outfile: `./dist/${path}`,
			bundle: true,
			...options,
		})
	}
}