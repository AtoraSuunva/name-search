#!/usr/bin/env node
/*jshint esversion: 6 */
//This entire thing can probably more elegant but meh

const fs   = require('fs');
const path = require('path');
const resultsFolder = path.join('.', 'results');

if (process.argv.length === 4) {
	var flags = '';
	var folderToSearch = process.argv[2];
	var regex = process.argv[3];
} else if (process.argv.length === 5) {
	var flags = process.argv[2].toLowerCase();
	var folderToSearch = process.argv[3];
	var regex = process.argv[4];
}else if (process.argv[2] !== undefined && process.argv[2].toLowerCase().includes('--version')) {
	var pkg = require(path.join(__dirname, 'package.json'));
	console.log(pkg.version);
	process.exit();
} else {
	console.log('search [-qdfr] "directory/to/search" "some|(regex)"');
	console.log('-q: Quiet mode, don\'t output anything');
	console.log('-v: Verbose, log lots of things');
	console.log('-d: Dry run, don\'t save to a directory (Can be used to count the amount of matches)');
	console.log('-f: Silence errors');
	console.log('-r: Recursive Search, search subdirectories of the directory');
	console.log('--version: View current version');
	process.exit(0);
}

if (!flags.includes('d')) {
	if (fs.existsSync(resultsFolder)) {
		if (flags.includes('v')) console.log('Found old results folder, deleting...');
		var oldFiles = fs.readdirSync(resultsFolder);
		for(var file of oldFiles) {
			try {
				fs.unlinkSync(path.join('.', 'results', file));
				if (flags.includes('v')) console.log(`Deleting ${path.join('.', 'results', file)}`);
			} catch (e) {if (!flags.includes('f')) console.log(e);}
		}
		fs.rmdirSync(resultsFolder);
		if (flags.includes('v')) console.log('Deleted old folder');
	}
	fs.mkdirSync(resultsFolder);
	if (flags.includes('v')) console.log('Made new results folder');
}
try {
	if (!flags.includes('r')) {
		if (flags.includes('v')) console.log('Using non-recursive search');
		var files = fs.readdirSync(folderToSearch);
	} else {
		if (flags.includes('v')) console.log('Using recursive search');
		var files = walkSync(folderToSearch); //Recursive search, search subdirectories of the folder
	}
} catch (e) {
	if (!flags.includes('f')) console.log('No folder found!');
	process.exit(0);
}

var results = 0;
var filesSearched = 0;
for (file of files) {
	try {
		if (flags.includes('v')) console.log(`Looking at ${file}`);
		file = file.split('/'); //Split it to get the seperate directories
		var fileName = file.pop(); //grab the file name
		var regexMatch = fileName.search(regex) !== -1;
		if (flags.includes('v')) console.log(`File name is ${fileName}, file is at ${file.join('/')}`);
		if (flags.includes('v')) console.log(`Regex match? ${regexMatch}`);
		if (regexMatch) {
			var isDirectory = fs.statSync(path.join((flags.includes('r')?'':folderToSearch), ...file, fileName)).isDirectory();
			if (flags.includes('v')) console.log(`Directory? ${isDirectory}`);
			
			if (!isDirectory) {
				results++;
				if (!flags.includes('d')) {
					fs.linkSync(path.join((flags.includes('r')?'':folderToSearch), ...file, fileName), path.join(resultsFolder, fileName));
				}
				if ( flags.includes('v')) console.log(`Linking ${path.join((flags.includes('r')?'':folderToSearch), ...file, fileName)} to ${path.join(resultsFolder, fileName)}`);
				//holy shit spread syntax in the wild!
			}
		}
	} catch (e) {if (!flags.includes('f')) process.stdout.write(`Couldn\'t link file/directory "${file}"`);}
	filesSearched++;
	process.stdout.cursorTo(0);
	process.stdout.write(loadingBar(filesSearched, files.length, process.stdout.columns - 8));
	process.stdout.cursorTo(0);
}
process.stdout.clearLine();
if (!flags.includes('q')) console.log(`Found ${results} result${results !== 1 ? 's' : ''}`);

if (results === 0 && !flags.includes('d')) {
	fs.rmdirSync(resultsFolder);
	if (flags.includes('v')) console.log('Deleted empty results folder');
}

function walkSync(dir, filelist) {
  var path = path || require('path');
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
}

function loadingBar(current, max, width) {
	var currentPercent = current/ max;
	var filled = '#'.repeat(Math.floor(currentPercent * width));
	var empty  = ' '.repeat(width - Math.floor(currentPercent * width));

	return '[' + filled + empty + ']' + ' ' + Math.floor(currentPercent*1000)/10 + '%';
}
