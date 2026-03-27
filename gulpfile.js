const { src, dest, parallel } = require('gulp');

function copyNodeIcons() {
	return src('nodes/**/*.svg').pipe(dest('dist/nodes'));
}

function copyCredentialIcon() {
	return src('nodes/Wcrm/wcrm.svg').pipe(dest('dist/credentials'));
}

exports['build:icons'] = parallel(copyNodeIcons, copyCredentialIcon);
